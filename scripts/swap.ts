import axios from "axios";
import { writeFileSync, readFileSync } from "fs";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

interface SimpleNetwork {
    name: string;
    chain_id: string;
    node_url: string;
    token_symbol: string | null;
    decimals: string;
}

interface LoggedSwap {
    destination_network: string;
    chain_id: string;
    swapResponse: any;
    depositTxHash: string;
}

async function main() {
    const apiUrl = process.env.API_URL!;
    const apiKey = process.env.API_KEY!;
    const destinationAddr = process.env.DESTINATION_ADDRESS!;
    const amountEth = parseFloat(process.env.AMOUNT_ETH!);
    const privateKey = process.env.PRIVATE_KEY!;

    if (!apiUrl || !apiKey || !destinationAddr || !amountEth || !privateKey) {
        console.error("❌ One or more required environment variables are missing.");
        process.exit(1);
    }

    // 1) Load networks-simple.json
    const rawNetworks = readFileSync("networks-simple.json", "utf-8");
    const allNetworks: SimpleNetwork[] = JSON.parse(rawNetworks);

    // 2) Build a map from networkName → node_url, for easy lookup.
    const nodeUrlMap: Record<string, string> = {};
    for (const net of allNetworks) {
        nodeUrlMap[net.name] = net.node_url;
    }

    // 3) Identify the RPC URL for ARBITRUM_MAINNET (so we don't hard-code it).
    const arbRpc = nodeUrlMap["ARBITRUM_MAINNET"];
    if (!arbRpc) {
        console.error("❌ Could not find ARBITRUM_MAINNET in networks-simple.json");
        process.exit(1);
    }

    // 4) Filter out only those chains whose token_symbol == "ETH"
    const ethChains = allNetworks.filter(net => net.token_symbol === "ETH");
    if (ethChains.length === 0) {
        console.error("⚠️  No networks found with token_symbol === 'ETH' in networks-simple.json");
        process.exit(1);
    }

    // Estimate fee for contract deployment
    const MyArtifact = require("../artifacts/contracts/balanceviewer.sol/BalanceViewer.json");
    const bytecode = MyArtifact.bytecode;

    // 5) Prepare a provider and wallet for Arbitrum (source chain)
    const provider = new ethers.JsonRpcProvider(arbRpc);
    const wallet = new ethers.Wallet(privateKey, provider);

    const factory = new ethers.ContractFactory(MyArtifact.abi, bytecode, null);
    const unsignedTx = await factory.getDeployTransaction();

    // 6) Accumulate logs into this array and write it at the end
    const logAllSwaps: LoggedSwap[] = [];
    const successfullySwappedChains: string[] = [];

    // 7) For each ETH-based chain, perform a swap and deposit
    for (const chain of ethChains) {
        const chainProvider = new ethers.JsonRpcProvider(chain.node_url);
        let feeWei: bigint;
        
        try {
          const estimatedGas: bigint = await chainProvider.estimateGas(unsignedTx);
          const feeData = await chainProvider.getFeeData();
          const perGas: bigint = feeData.maxFeePerGas ?? feeData.gasPrice!;
          feeWei = (estimatedGas * perGas * 12n + 9n) / 10n;
        } catch {
          feeWei = ethers.parseUnits(amountEth.toString(), chain.decimals);
        }
        
        const formattedFee = ethers.formatUnits(feeWei, chain.decimals);
        console.log(`for chain ${chain.name}, fee ≈ ${formattedFee} (native tokens)`);

        if (chain.name === "ARBITRUM_MAINNET") {
            continue;
        }

        console.log(`\n🔄 Starting swap → ${chain.name} (chain_id=${chain.chain_id})`);

        // Build the swap request payload
        const data = {
            destination_address: destinationAddr,
            reference_id: null,
            source_network: "ARBITRUM_MAINNET",
            source_token: "ETH",
            destination_network: chain.name,
            destination_token: "ETH",
            refuel: false,
            use_deposit_address: false,
            use_new_deposit_address: null,
            amount: formattedFee,
            source_address: null,
            slippage: null,
        };

        console.log("swap data:", data);

        let swapResponse: any;
        try {
            const resp = await axios.post(apiUrl, data, {
                headers: {
                    "X-LS-APIKEY": apiKey,
                    "Content-Type": "application/json",
                },
            });
            swapResponse = resp.data;
        } catch (err: any) {
            console.error(`❌ Swap request failed for ${chain.name}:`, err.response?.status, err.response?.data || err.message);
            // Skip to next chain
            continue;
        }

        // // Write each swap response to its own file
        // const singleOutFile = `swap-response-${chain.chain_id}.json`;
        // writeFileSync(singleOutFile, JSON.stringify(swapResponse, null, 2), "utf-8");
        // console.log(`✅ Swap response for ${chain.name} saved to ${singleOutFile}`);

        // 8) Extract the deposit action (must exist in the swapResponse)
        const depositAction = swapResponse?.data?.deposit_actions?.[0];
        if (!depositAction) {
            console.error(`❌ No deposit action found in swap response for ${chain.name}. Skipping deposit.`);
            continue;
        }

        const depositAddress = depositAction.to_address as string;
        const depositAmountRaw = depositAction.amount_in_base_units.toString();

        console.log("Deposit address on Arbitrum:", depositAddress);
        console.log("Deposit amount (in base units):", depositAmountRaw);

        // 9) Send the deposit TX on Arbitrum
        let depositTxHash: string;
        try {
            const tx = await wallet.sendTransaction({
                to: depositAddress,
                // value must be a BigInt or hex string; ethers will parse the string as wei.
                value: depositAmountRaw,
            });
            console.log("⏳ Deposit transaction broadcasted. Waiting for confirmation...");
            const receipt = await tx.wait();
            if (receipt === null) {
                throw new Error("Transaction receipt was null – the transaction may not have been mined.");
            }
            depositTxHash = receipt.hash;
            console.log(`✅ Deposit confirmed (txHash: ${depositTxHash})`);
            successfullySwappedChains.push(chain.name);
        } catch (err: any) {
            console.error(`❌ Failed to send deposit transaction for ${chain.name}:`, err);
            depositTxHash = `ERROR: ${err.message || "unknown"}`;
        }

        // 10) Push an entry into log array
        logAllSwaps.push({
            destination_network: chain.name,
            chain_id: chain.chain_id,
            swapResponse,
            depositTxHash
        });

    }

    // 11) At the end, write out the entire history into one file
    writeFileSync("all-swap-tx-log.json", JSON.stringify(logAllSwaps, null, 2), "utf-8");
    console.log("\n📄 All swaps & deposit tx hashes have been saved to all-swap-tx-log.json");


    writeFileSync("swapped-chains.json", JSON.stringify(successfullySwappedChains, null, 2), "utf-8");
    console.log("\n📄 All swaps & deposit tx hashes have been saved to swapped-chains.json");
}

main().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
