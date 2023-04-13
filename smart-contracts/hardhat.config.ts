import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config"

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  gasReporter: {
    enabled: true,
    gasPrice: 21,
    currency: 'USD',
    coinmarketcap: String(process.env.CMC_API_KEY)
  }
};

export default config;
