// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require('hardhat');

// returns the ether balance of an address
async function getEtherBalance(address) {
  const balanceBigInt = await hre.ethers.provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt); // format the big integer balance
}

// logs the ether balance for a list of the addresses
async function logBalances(addresses) {
  let idx = 0;
  for (const address of addresses) {
    console.log('Address %s balance: %s', idx, await getEtherBalance(address));
    idx++;
  }
}

// logs the memos stored on-chain from the coffee purchases
async function logMemos(memos) {
  for (const memo of memos) {
    const tipper = memo.name;
    const tipperAddress = memo.address;
    const message = memo.message;
    const timestamp = memo.timestamp;
    console.log(
      `At ${timestamp}, ${tipper} (${tipperAddress}) said: ${message}`
    );
  }
}

async function main() {
  // Get example accounts
  const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();

  // Get the contract to deploy and deploy
  const BuyMeACoffee = await hre.ethers.getContractFactory('BuyMeACoffee');
  const buyMeACoffee = await BuyMeACoffee.deploy();
  await buyMeACoffee.deployed();
  console.log('BuyMeACoffee deployed to: %s', buyMeACoffee.address);

  // Check balances before the coffee purchase
  const addresses = [
    owner.address,
    tipper.address,
    tipper2.address,
    tipper3.address,
    buyMeACoffee.address,
  ];
  console.log('== Addresses before coffee purchase ==');
  await logBalances(addresses);

  // Buy the owner a few coffees
  const tip = { value: hre.ethers.utils.parseEther('3.0') };
  await buyMeACoffee
    .connect(tipper)
    .buyCoffee('Carolina', "You're the best...:)", tip);
  await buyMeACoffee.connect(tipper2).buyCoffee('Sam', "How's your day??", tip);
  await buyMeACoffee
    .connect(tipper3)
    .buyCoffee('Jacob', "Love what you're doing", tip);

  // Check balance after the purchase of coffee
  console.log('== Addresses after coffee purchases ==');
  await logBalances(addresses);

  // Withdraw funds
  await buyMeACoffee.connect(owner).withdrawTips();

  // Check balance after the withdraw of tips
  console.log('== After the withdrawal of tips ==');
  await logBalances(addresses);

  // Get all the memos left for the owner
  console.log('== Memos ==');
  const memos = await buyMeACoffee.getMemos();
  logMemos(memos);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
