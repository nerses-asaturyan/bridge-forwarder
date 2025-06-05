const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const networks = [
  "ETHEREUM_MAINNET",
];

const ignitionModule = "./ignition/modules/forwarder/deployForwarder.js";
const logFile = path.join(__dirname, "deploy-log.json");
let results = [];

async function deployToNetwork(network, timeout = 300000) { 
  return new Promise((resolve) => {
    const cmd = `yes | npx hardhat ignition deploy ${ignitionModule} --network ${network}`;
    console.log(`\nDeploying to ${network}...`);

    const proc = exec(cmd, { timeout }, (error, stdout, stderr) => {
      const match = stdout.match(/ForwarderModule#Forwarder\s*-\s*(0x[a-fA-F0-9]{40})/);
      const forwarderAddress = match ? match[1] : null;
      let entry = {
        network,
        status: error ? "failed" : "success",
        contract: forwarderAddress,
        output: stdout,
        error: stderr || (error && error.message) || null,
        timestamp: new Date().toISOString(),
      };
      if (error) {
        console.error(`[${network}] Deployment failed or timed out.`);
      } else {
        console.log(`[${network}] Deployment succeeded.`);
      }
      results.push(entry);
      fs.writeFileSync(logFile, JSON.stringify(results, null, 2));
      resolve();
    });
    setTimeout(() => {
      proc.kill();
      console.error(`[${network}] Deployment forcibly killed after timeout.`);
    }, timeout + 5000);
  });
}

async function main() {
  for (const network of networks) {
    await deployToNetwork(network);
  }
  console.log("\nAll deployments attempted. Results are in deploy-log.json");
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  fs.writeFileSync(logFile, JSON.stringify(results, null, 2));
});
