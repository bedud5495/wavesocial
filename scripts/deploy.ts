import { network } from "hardhat";

async function main() {
  console.log("Deploying SWAVE Token and SocialWave contracts...");

  const { ethers } = await network.connect({ network: "opbnbTestnet" });
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "BNB");

  const SWAVEToken = await ethers.getContractFactory("SWAVEToken");
  const swaveToken = await SWAVEToken.deploy();
  await swaveToken.waitForDeployment();
  const swaveTokenAddress = await swaveToken.getAddress();

  console.log("SWAVE Token deployed to:", swaveTokenAddress);

  const SocialWave = await ethers.getContractFactory("SocialWave");
  const socialWave = await SocialWave.deploy(swaveTokenAddress);
  await socialWave.waitForDeployment();
  const socialWaveAddress = await socialWave.getAddress();

  console.log("SocialWave contract deployed to:", socialWaveAddress);

  const tokenContract = await ethers.getContractAt("SWAVEToken", swaveTokenAddress);
  const ownershipTx = await tokenContract.transferOwnership(socialWaveAddress);
  await ownershipTx.wait();

  console.log("SWAVE Token ownership transferred to SocialWave contract");

  console.log("\n=== Deployment Summary ===");
  console.log("SWAVE Token:", swaveTokenAddress);
  console.log("SocialWave:", socialWaveAddress);
  console.log("\nSave these addresses to your .env file:");
  console.log(`VITE_SWAVE_TOKEN_ADDRESS=${swaveTokenAddress}`);
  console.log(`VITE_SOCIAL_WAVE_ADDRESS=${socialWaveAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
