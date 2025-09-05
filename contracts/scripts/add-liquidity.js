const { ethers } = require("hardhat");

async function main() {
  console.log("💧 向 YDToken 合约添加流动性...\n");

  // 获取合约地址
  const YD_TOKEN_ADDRESS = "0xcD274B0B4cf04FfB5E6f1E17f8a62239a9564173";
  
  // 连接到合约
  const YDToken = await ethers.getContractAt("YDToken", YD_TOKEN_ADDRESS);
  
  // 获取当前账户
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();
  
  console.log(`🦊 当前账户: ${signerAddress}`);
  
  // 检查是否是owner
  const owner = await YDToken.owner();
  if (signerAddress.toLowerCase() !== owner.toLowerCase()) {
    console.log("❌ 错误: 只有合约owner可以添加流动性");
    console.log(`   合约owner: ${owner}`);
    return;
  }
  
  // 检查当前余额
  const signerBalance = await ethers.provider.getBalance(signerAddress);
  const contractBalance = await ethers.provider.getBalance(YD_TOKEN_ADDRESS);
  
  console.log(`💰 当前状态:`);
  console.log(`   账户ETH余额: ${ethers.formatEther(signerBalance)} ETH`);
  console.log(`   合约ETH余额: ${ethers.formatEther(contractBalance)} ETH\n`);
  
  // 设置要添加的流动性数量 (0.1 ETH)
  const liquidityAmount = ethers.parseEther("0.1");
  
  if (signerBalance < liquidityAmount) {
    console.log("❌ 错误: 账户ETH余额不足");
    console.log(`   需要: ${ethers.formatEther(liquidityAmount)} ETH`);
    console.log(`   余额: ${ethers.formatEther(signerBalance)} ETH`);
    return;
  }
  
  try {
    console.log(`🚀 添加流动性: ${ethers.formatEther(liquidityAmount)} ETH...`);
    
    // 调用 addLiquidity 函数
    const tx = await YDToken.addLiquidity({
      value: liquidityAmount,
      gasLimit: 100000
    });
    
    console.log(`📝 交易哈希: ${tx.hash}`);
    console.log("⏳ 等待交易确认...");
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log("✅ 流动性添加成功!");
      
      // 检查更新后的余额
      const newContractBalance = await ethers.provider.getBalance(YD_TOKEN_ADDRESS);
      console.log(`\n💧 更新后的合约流动性:`);
      console.log(`   合约ETH余额: ${ethers.formatEther(newContractBalance)} ETH`);
      
      // 计算可兑换的YD代币数量
      const exchangeRate = await YDToken.EXCHANGE_RATE();
      const maxYDExchangeable = newContractBalance * exchangeRate;
      console.log(`   可兑换YD数量: ${ethers.formatEther(maxYDExchangeable)} YD`);
      
      console.log(`\n🔗 查看交易: https://sepolia.etherscan.io/tx/${tx.hash}`);
      
    } else {
      console.log("❌ 交易失败");
    }
    
  } catch (error) {
    console.error("❌ 添加流动性失败:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("💡 请确保账户有足够的ETH支付gas费用");
    }
  }
  
  console.log("\n📋 下一步:");
  console.log("1. 确认合约有足够的ETH流动性");
  console.log("2. 在前端测试ETH → YD兑换");
  console.log("3. 在前端测试YD → ETH兑换");
  console.log("4. 验证交易在区块链浏览器上的状态");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });