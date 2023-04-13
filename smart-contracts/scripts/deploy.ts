import { ethers } from "hardhat";

async function main() {
  const [owner, relay, treasury] = await ethers.getSigners();

  const Contract = await ethers.getContractFactory("SocialXP");
  const contract = await Contract.deploy(relay.address, treasury.address)

  await contract.deployed();

  console.log(
    `SocialXP deployed to ${contract.address} by ${owner.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
