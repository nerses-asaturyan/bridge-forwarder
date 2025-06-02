# Forwarder & BalanceViewer Contracts

## Overview

- **Forwarder:** Forwards ETH to a fixed address, emits events with custom data or IDs.
- **BalanceViewer:** Reads ETH and ERC20 balances for one or more users.

---

## Deploying with Hardhat Ignition

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create Ignition module for Forwarder (`ignition/modules/forwarder.js`):**
   ```js
   const { buildModule } = require("@nomicfoundation/ignition-core");
   module.exports = buildModule("ForwarderModule", (m) => {
     const solver = "0xSolverAddress";
     const forwarder = m.contract("Forwarder", [solver]);
     return { forwarder };
   });
   ```

3. **Create Ignition module for BalanceViewer (`ignition/modules/balanceViewer.js`):**
   ```js
   const { buildModule } = require("@nomicfoundation/ignition-core");
   module.exports = buildModule("BalanceViewerModule", (m) => {
     const balanceViewer = m.contract("BalanceViewer");
     return { balanceViewer };
   });
   ```

4. **Deploy:**
   ```bash
   npx hardhat ignition deploy ignition/modules/forwarder.js --network <network>
   npx hardhat ignition deploy ignition/modules/balanceViewer.js --network <network>
   ```

---

## Verifying Contracts

Make sure your `hardhat.config.js` has your Etherscan API key.  
Then verify:

- **Forwarder:**
   ```bash
   npx hardhat verify --network <network> <DEPLOYED_ADDRESS> <solver>
   ```
- **BalanceViewer:**
   ```bash
   npx hardhat verify --network <network> <DEPLOYED_ADDRESS>
   ```

---

## Usage

- **Forwarder:**  
  Send ETH to the contract or call `forward` / `forwardInt`. Funds are sent to the `SOLVER` address. Events are emitted.

- **BalanceViewer:**  
  Use `getBalances(user, tokens)` or `getMultiUserBalances(users, tokens)` to fetch ETH and ERC20 balances.

---

## License

ISC
