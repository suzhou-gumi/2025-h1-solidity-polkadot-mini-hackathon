async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("👷 Deploying with:", deployer.address);

  const NFT = await ethers.getContractFactory("GomokuNFT");
  const contract = await NFT.deploy();
  await contract.deployed();

  console.log("✅ Deployed at:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
