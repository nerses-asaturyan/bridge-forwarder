const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');


module.exports = buildModule('BalanceViewerModule', (m) => {
  const balanceViewer = m.contract('BalanceViewer');
  return { balanceViewer };
});