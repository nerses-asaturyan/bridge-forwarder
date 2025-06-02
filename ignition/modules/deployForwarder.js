const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

const SOLVER_ADDRESS = "0x...";

module.exports = buildModule('ForwarderModule', (m) => {
  const forwarder = m.contract('Forwarder',[SOLVER_ADDRESS]);
  return { forwarder };
});