const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 检查 YDToken 合约状态...\n");

  // 获取合约地址
  const YD_TOKEN_ADDRESS = "0xcD274B0B4cf04FfB5E6f1E17f8a62239a9564173";
  
  // 连接到合约
  const YDToken = await ethers.getContractAt("YDToken", YD_TOKEN_ADDRESS);
  
  // 获取合约基本信息
  const name = await YDToken.name();
  const symbol = await YDToken.symbol();
  const decimals = await YDToken.decimals();
  const totalSupply = await YDToken.totalSupply();
  const exchangeRate = await YDToken.EXCHANGE_RATE();
  
  console.log("📊 合约基本信息:");
  console.log(`   名称: ${name}`);
  console.log(`   符号: ${symbol}`);
  console.log(`   小数位: ${decimals}`);
  console.log(`   总供应量: ${ethers.formatEther(totalSupply)} ${symbol}`);
  console.log(`   兑换汇率: 1 ETH = ${exchangeRate} ${symbol}\n`);
  
  // 检查合约ETH余额
  const contractBalance = await ethers.provider.getBalance(YD_TOKEN_ADDRESS);
  console.log("💰 合约流动性:");
  console.log(`   ETH 余额: ${ethers.formatEther(contractBalance)} ETH`);
  
  if (contractBalance === 0n) {
    console.log("   ⚠️  警告: 合约没有ETH余额，用户无法将YD代币兑换回ETH");
    console.log("   💡 建议: 合约owner需要调用 addLiquidity() 函数向合约存入ETH\n");
  } else {
    console.log(`   ✅ 合约有足够流动性，可兑换 ${ethers.formatEther(contractBalance * exchangeRate)} ${symbol}\n`);
  }
  
  // 获取合约owner
  const owner = await YDToken.owner();
  console.log("👑 合约管理:");
  console.log(`   Owner: ${owner}`);
  
  // 获取当前账户信息
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();
  const signerBalance = await ethers.provider.getBalance(signerAddress);
  const signerYDBalance = await YDToken.balanceOf(signerAddress);
  
  console.log(`\n🦊 当前账户 (${signerAddress}):`);
  console.log(`   ETH 余额: ${ethers.formatEther(signerBalance)} ETH`);
  console.log(`   ${symbol} 余额: ${ethers.formatEther(signerYDBalance)} ${symbol}`);
  
  // 检查是否是owner
  if (signerAddress.toLowerCase() === owner.toLowerCase()) {
    console.log("   ✅ 您是合约Owner，可以管理流动性");
    
    if (contractBalance === 0n) {
      console.log("\n💡 建议执行以下操作添加流动性:");
      console.log(`   npx hardhat run scripts/add-liquidity.js --network sepolia`);
    }
  }
  
  console.log("\n🚀 测试建议:");
  console.log("1. 确保钱包连接到Sepolia测试网");
  console.log("2. 获取测试ETH: https://sepoliafaucet.com/");
  console.log("3. 在前端尝试ETH → YD兑换");
  console.log("4. 在前端尝试YD → ETH兑换（需要合约有ETH流动性）");
  console.log("\n🔗 合约地址:");
  console.log(`   YDToken: https://sepolia.etherscan.io/address/${YD_TOKEN_ADDRESS}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });