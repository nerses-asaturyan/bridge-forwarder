require("@nomicfoundation/hardhat-toolbox");
require("@matterlabs/hardhat-zksync-deploy");
require("dotenv").config();

const networksSimple = require("./networks-simple.json");

const dynamicNetworks = networksSimple.reduce((obj, net) => {
  obj[net.name] = {
    url: net.node_url,
    accounts: [process.env.PRIVATE_KEY],
    chainId: Number(net.chain_id),
  };
  return obj;
}, {});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  zksolc: {
    version: "latest",
    settings: {},
  },
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    SOPHON_MAINNET: {
      url: "https://rpc.sophon.xyz",
      ethNetwork: "mainnet",
      verifyURL: "https://verification-explorer.sophon.xyz/contract_verification",
      browserVerifyURL: "https://explorer.sophon.xyz/",
      enableVerifyURL: true,
      zksync: false,
      accounts: [process.env.PRIVATE_KEY],
    },
    REDSTONE_MAINNET: {
      url: "https://rpc.redstonechain.com",
      accounts: [process.env.PRIVATE_KEY],
    },
    mainnet: {
      url: process.env.ethRPC,
      accounts: [process.env.PRIVATE_KEY],
    },
    arbitrumOne: {
      url: process.env.arbitrumRPC,
      accounts: [process.env.mainnet],
    },
    optimisticEthereum: {
      url: process.env.optimismRPC,
      accounts: [process.env.mainnet],
    },
    base: {
      url: process.env.baseRPC,
      accounts: [process.env.mainnet],
    },
    mantleSepolia: {
      url: 'https://endpoints.omniatech.io/v1/mantle/sepolia/public',
      accounts: [process.env.PRIV_KEY],
    },
    berachain: {
      url: 'https://bartio.rpc.berachain.com/',
      accounts: [process.env.PRIV_KEY],
    },
    kakarot_sepolia: {
      url: 'https://sepolia-rpc.kakarot.org',
      accounts: [process.env.PRIV_KEY],
    },
    unichainSepolia: {
      url: 'https://sepolia.unichain.org',
      accounts: [process.env.PRIV_KEY],
    },
    arbitrumSepolia: {
      url: 'https://arbitrum-sepolia.infura.io/v3/',
      accounts: [process.env.PRIV_KEY],
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/`,
      accounts: [process.env.PRIV_KEY],
    },
    lineaSepolia: {
      url: 'https://rpc.sepolia.linea.build',
      accounts: [process.env.PRIV_KEY],
      chainId: 59141,
    },
    optimismSepolia: {
      url: 'https://sepolia.optimism.io',
      accounts: [process.env.PRIV_KEY],
      chainId: 11155420,
    },
    taikoHekla: {
      url: 'https://rpc.hekla.taiko.xyz.',
      accounts: [process.env.PRIV_KEY],
      chainId: 167009,
    },
    taiko: {
      url: 'https://rpc.mainnet.taiko.xyz',
      accounts: [process.env.PRIV_KEY],
      chainId: 167000,
    },
    immutableTestnet: {
      url: 'https://rpc.testnet.immutable.com',
      accounts: [process.env.PRIV_KEY],
      chainId: 13473,
    },
    minato: {
      url: 'https://rpc.minato.soneium.org/',
      accounts: [process.env.PRIV_KEY],
    },
    NAHMII_MAINNET: {
      url: "https://rpc.n3.nahmii.io",
      accounts: [process.env.PRIVATE_KEY],
    },
    zero: {
      url: 'https://rpc.zerion.io/v1/zero',
      zksync: false,
      ethNetwork: 'mainnet',
      accounts: [process.env.PRIVATE_KEY]
    },
    zero: {
      url: 'https://rpc.zerion.io/v1/zero',
      zksync: true,
      ethNetwork: 'mainnet',
      verifyURL: 'any',
      accounts: [process.env.PRIVATE_KEY]
    },
    ...dynamicNetworks,
  },
  etherscan: {
    apiKey: {
      berachain: process.env.berachain,
      unichainSepolia: process.env.unichainSepolia,
      immutableTestnet: process.env.immutableTestnet,
      optimismSepolia: process.env.optimismSepolia,
      lineaSepolia: process.env.lineaSepolia,
      taikoHekla: process.env.taikoHekla,
      arbitrumSepolia: process.env.arbitrumSepolia,
      minato: process.env.minato,
      sepolia: process.env.sepolia,
      kakarot_sepolia: process.env.kakarotSepolia,
      mantleSepolia: process.env.mantleSepolia,
      mainnet: process.env.sepolia,
      optimisticEthereum: process.env.optimismSepolia,
      arbitrumOne: process.env.arbitrumSepolia,
      base: process.env.baseAPIKey,
      taiko: process.env.taiko
    },
    customChains: [
      {
        network: "ZERO_MAINNET",
        chainId: 543210,
        urls: {
          apiURL: "https://zero-network.calderaexplorer.xyz/api",
          browserURL: "https://zero-network.calderaexplorer.xyz"
        }
      },
      {
        network: 'mantleSepolia',
        chainId: 5003,
        urls: {
          apiURL: 'https://api-sepolia.mantlescan.xyz/api',
          browserURL: 'https://sepolia.mantlescan.xyz/',
        },
      },
      {
        network: "taiko",
        chainId: 167000,
        urls: {
          apiURL: "https://api.taikoscan.io/api",
          browserURL: " https://taikoscan.io",
        },
      },
      {
        network: 'berachain',
        chainId: 80084,
        urls: {
          apiURL: 'https://api.routescan.io/v2/network/testnet/evm/80084/etherscan/api/',
          browserURL: 'https://bartio.beratrail.io/',
        },
      },
      {
        network: 'unichainSepolia',
        chainId: 1301,
        urls: {
          apiURL: 'https://sepolia.uniscan.xyz/api',
          browserURL: '	https://sepolia.uniscan.xyz/',
        },
      },
      {
        network: 'lineaSepolia',
        chainId: 59141,
        urls: {
          apiURL: 'https://api-sepolia.lineascan.build/api',
          browserURL: 'https://sepolia.lineascan.build',
        },
      },
      {
        network: 'optimismSepolia',
        chainId: 11155420,
        urls: {
          apiURL: 'https://api-sepolia-optimistic.etherscan.io/api',
          browserURL: 'https://sepolia-optimism.etherscan.io/',
        },
      },
      {
        network: 'taikoHekla',
        chainId: 167009,
        urls: {
          apiURL: 'https://blockscout.hekla.taiko.xyz/api',
          browserURL: 'https://blockscoutapi.hekla.taiko.xyz/',
        },
      },
      {
        network: 'immutableTestnet',
        chainId: 13473,
        urls: {
          apiURL: 'https://explorer.testnet.immutable.com/api',
          browserURL: 'https://explorer.testnet.immutable.com/',
        },
      },
      {
        network: 'arbitrumSepolia',
        chainId: 421614,
        urls: {
          apiURL: 'https://api-sepolia.arbiscan.io/api',
          browserURL: 'https://sepolia.arbiscan.io/',
        },
      },
      {
        network: 'kakarot_sepolia',
        chainId: 920637907288165,
        urls: {
          apiURL: 'https://api.routescan.io/v2/network/testnet/evm/920637907288165/etherscan',
          browserURL: 'https://sepolia.kakarotscan.org',
        },
      },
      {
        network: 'minato',
        chainId: 1946,
        urls: {
          apiURL: 'https://explorer-testnet.soneium.org/api',
          browserURL: 'https://explorer-testnet.soneium.org/',
        },
      },
    ],
    sourcify: {
      enabled: false,
    },
  }
}