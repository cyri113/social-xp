import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config"

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  gasReporter: {
    enabled: true,
    gasPrice: 21,
    currency: 'USD',
    coinmarketcap: String(process.env.CMC_API_KEY),
    // token: 'MATIC',
    // gasPriceApi: 'https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice',
    // token: 'BNB',
    // gasPriceApi: 'https://api.bscscan.com/api?module=proxy&action=eth_gasPrice',
  },
  networks: {
    sepolia: {
      url: 'https://rpc2.sepolia.org',
      accounts: [String(process.env.PRIVATE_KEY_OWNER), String(process.env.PRIVATE_KEY_RELAY)]
    }
  },
  etherscan: {
    apiKey: String(process.env.ETHERSCAN_API_KEY),
  },
};

export default config;
