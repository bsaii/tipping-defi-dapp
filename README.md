# Buy Me a Coffee DeFi dapp

![Screenshot 2022-08-30 162345](https://user-images.githubusercontent.com/79695976/187790565-1fddf516-2779-48ab-9d5e-6eac8ff40a78.png)

Buy Me A Coffee is a popular website that creators, educators, entertainers, and all kinds of people use to create a landing page where anyone can send some amount of money as a thank you for their services. However, in order to use it, you must have a bank account and a credit card. Not everyone has that!

A benefit of decentralized applications built on top of a blockchain is that anyone from around the world can access the app using just an Ethereum wallet, which anyone can set up for free in under 1 minute. Let's see how we can use that to our advantage!

This project is a deployed(Goerli Testnet) decentralized "Buy Me a Coffee" smart contract that allows visitors to send you (fake) ETH as tips and leave nice messages, using Alchemy, Hardhat, Ethers.js, and Ethereum Goerli.

## Getting started with the smart contract

1. Clone the repository and run `yarn install` or `npm install`

2. Compile the contract by running `npx hardhat compile`

3. Deploy the smart contract in the localhost network : `npx hardhat run --network localhost scripts/deploy.js`

 You can target any network from your Hardhat config using: `npx hardhat run --network <your-network> scripts/deploy.js`
 
__Congrats! You have compiled and deployed the smart contract.__

## Getting started with the frontend of the DeFi dapp

1. Change the directory to the clients folder : `cd client`

2. Install the dependencies needed to run the project: `yarn install` or `npm install`

3. Run `yarn dev` or `npm run dev` to start the project locally.

__Have Fun!__
