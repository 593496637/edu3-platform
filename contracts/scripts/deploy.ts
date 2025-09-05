const hardhat = require("hardhat");

async function main() {
  console.log("开始部署合约...");

  try {
    // 获取公共客户端和钱包客户端
    const publicClient = await hardhat.viem.getPublicClient();
    const [walletClient] = await hardhat.viem.getWalletClients();

    console.log("部署账户:", walletClient.account.address);
    console.log("网络ID:", await publicClient.getChainId());

    // 1. 部署YD代币合约
    console.log("\n1. 部署YD代币合约...");
    const ydToken = await hardhat.viem.deployContract("YDToken");
    console.log("YD代币合约地址:", ydToken.address);

    // 2. 部署课程平台合约
    console.log("\n2. 部署课程平台合约...");
    const coursePlatform = await hardhat.viem.deployContract("CoursePlatform", [
      ydToken.address,
    ]);
    console.log("课程平台合约地址:", coursePlatform.address);

    console.log("\n=== 部署完成 ===");
    console.log("YD代币合约:", ydToken.address);
    console.log("课程平台合约:", coursePlatform.address);

    // 保存地址到文件
    const addresses = {
      YDToken: ydToken.address,
      CoursePlatform: coursePlatform.address,
      chainId: await publicClient.getChainId(),
      deployedAt: new Date().toISOString(),
    };

    console.log("\n=== 合约地址配置 ===");
    console.log(JSON.stringify(addresses, null, 2));
  } catch (error) {
    console.error("部署失败:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
