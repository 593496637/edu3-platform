import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployModule = buildModule("DeployModule", (m) => {
  // 1. 部署YD代币合约
  const ydToken = m.contract("YDToken");

  // 2. 部署课程平台合约，传入YD代币地址
  const coursePlatform = m.contract("CoursePlatform", [ydToken]);

  return { ydToken, coursePlatform };
});

export default DeployModule;
