require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

// Successfully verified contract BuyMeACoffee on Etherscan.
// https://goerli.etherscan.io/address/0x734E3e96aa2e45c308229f021202dc5f7Ea1cDd8#code

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL;
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.9',
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  networks: {
    goerli: {
      url: ALCHEMY_API_URL,
      accounts: [GOERLI_PRIVATE_KEY],
    },
  },
};
