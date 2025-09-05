import { createPublicClient, createWalletClient, http } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config();

// 新部署的合约地址
const YD_TOKEN_ADDRESS = "0xcD274B0B4cf04FfB5E6f1E17f8a62239a9564173";
const COURSE_PLATFORM_ADDRESS = "0xD3Ff74DD494471f55B204CB084837D1a7f184092";

// 合约ABI（简化版）
const ydTokenABI = [
  {
    inputs: [],
    name: "name",
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "EXCHANGE_RATE",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ type: "address" }],
    name: "balanceOf",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
];

const coursePlatformABI = [
  {
    inputs: [],
    name: "ydToken",
    outputs: [{ type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "platformFeeRate",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextCourseId",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalCourses",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ type: "address" }],
    name: "isInstructor",
    outputs: [{ type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
];

async function main() {
  console.log("验证新部署的合约...");

  try {
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(process.env.SEPOLIA_RPC_URL),
    });

    const account = privateKeyToAccount(`0x${process.env.SEPOLIA_PRIVATE_KEY}`);
    console.log("验证账户:", account.address);

    // 验证YD代币合约
    console.log("\n=== 验证新的YD代币合约 ===");
    const tokenName = await publicClient.readContract({
      address: YD_TOKEN_ADDRESS,
      abi: ydTokenABI,
      functionName: "name",
    });

    const tokenSymbol = await publicClient.readContract({
      address: YD_TOKEN_ADDRESS,
      abi: ydTokenABI,
      functionName: "symbol",
    });

    const exchangeRate = await publicClient.readContract({
      address: YD_TOKEN_ADDRESS,
      abi: ydTokenABI,
      functionName: "EXCHANGE_RATE",
    });

    const decimals = await publicClient.readContract({
      address: YD_TOKEN_ADDRESS,
      abi: ydTokenABI,
      functionName: "decimals",
    });

    const totalSupply = await publicClient.readContract({
      address: YD_TOKEN_ADDRESS,
      abi: ydTokenABI,
      functionName: "totalSupply",
    });

    const deployerBalance = await publicClient.readContract({
      address: YD_TOKEN_ADDRESS,
      abi: ydTokenABI,
      functionName: "balanceOf",
      args: [account.address],
    });

    console.log("✅ YD代币名称:", tokenName);
    console.log("✅ YD代币符号:", tokenSymbol);
    console.log("✅ 小数位数:", decimals);
    console.log("✅ 总供应量:", totalSupply.toString());
    console.log("✅ 兑换汇率:", exchangeRate.toString(), "YD/ETH");
    console.log("✅ 部署者余额:", deployerBalance.toString());

    // 验证课程平台合约
    console.log("\n=== 验证新的课程平台合约 ===");
    const ydTokenAddress = await publicClient.readContract({
      address: COURSE_PLATFORM_ADDRESS,
      abi: coursePlatformABI,
      functionName: "ydToken",
    });

    const platformFeeRate = await publicClient.readContract({
      address: COURSE_PLATFORM_ADDRESS,
      abi: coursePlatformABI,
      functionName: "platformFeeRate",
    });

    const nextCourseId = await publicClient.readContract({
      address: COURSE_PLATFORM_ADDRESS,
      abi: coursePlatformABI,
      functionName: "nextCourseId",
    });

    const totalCourses = await publicClient.readContract({
      address: COURSE_PLATFORM_ADDRESS,
      abi: coursePlatformABI,
      functionName: "getTotalCourses",
    });

    const isInstructor = await publicClient.readContract({
      address: COURSE_PLATFORM_ADDRESS,
      abi: coursePlatformABI,
      functionName: "isInstructor",
      args: [account.address],
    });

    console.log("✅ 平台中的YD代币地址:", ydTokenAddress);
    console.log("✅ 平台手续费率:", platformFeeRate.toString(), "基点");
    console.log("✅ 下一个课程ID:", nextCourseId.toString());
    console.log("✅ 当前课程总数:", totalCourses.toString());
    console.log("✅ 部署者是否为讲师:", isInstructor);

    // 地址匹配验证
    console.log("\n=== 地址匹配验证 ===");
    const addressMatch =
      ydTokenAddress.toLowerCase() === YD_TOKEN_ADDRESS.toLowerCase();
    console.log("地址匹配:", addressMatch ? "✅" : "❌");

    // 检查合约ETH余额
    const contractEthBalance = await publicClient.getBalance({
      address: YD_TOKEN_ADDRESS,
    });
    console.log("合约ETH余额:", contractEthBalance.toString());

    console.log("\n=== 新合约验证完成 ===");
    console.log("🎉 新合约部署和验证成功！");
    console.log(
      "YD代币: https://sepolia.etherscan.io/address/" + YD_TOKEN_ADDRESS
    );
    console.log(
      "课程平台: https://sepolia.etherscan.io/address/" +
        COURSE_PLATFORM_ADDRESS
    );

    console.log("\n=== 下一步：创建前端应用 ===");
    console.log("合约验证完成，可以开始创建前端了！");
  } catch (error) {
    console.error("❌ 验证失败:", error);
  }
}

main().catch(console.error);
