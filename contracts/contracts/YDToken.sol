// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract YDToken is ERC20, Ownable, ReentrancyGuard {
    // 汇率：1 ETH = 4000 YD
    uint256 public constant EXCHANGE_RATE = 4000;

    // 事件
    event TokensPurchased(
        address indexed buyer,
        uint256 ethAmount,
        uint256 tokenAmount
    );
    event TokensSold(
        address indexed seller,
        uint256 tokenAmount,
        uint256 ethAmount
    );

    constructor() ERC20("YD Token", "YD") Ownable(msg.sender) {
        // 初始铸造给合约owner一些代币用于流动性
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    /**
     * @dev 用ETH购买YD代币
     * 1 ETH = 4000 YD
     */
    function buyTokensWithETH() external payable nonReentrant {
        require(msg.value > 0, "ETH amount must be greater than 0");

        uint256 tokenAmount = msg.value * EXCHANGE_RATE;

        // 铸造代币给购买者
        _mint(msg.sender, tokenAmount);

        emit TokensPurchased(msg.sender, msg.value, tokenAmount);
    }

    /**
     * @dev 用YD代币换回ETH
     * 4000 YD = 1 ETH
     */
    function sellTokensForETH(uint256 tokenAmount) external nonReentrant {
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(
            balanceOf(msg.sender) >= tokenAmount,
            "Insufficient token balance"
        );

        uint256 ethAmount = tokenAmount / EXCHANGE_RATE;
        require(
            address(this).balance >= ethAmount,
            "Insufficient contract ETH balance"
        );

        // 销毁用户的代币
        _burn(msg.sender, tokenAmount);

        // 转ETH给用户
        payable(msg.sender).transfer(ethAmount);

        emit TokensSold(msg.sender, tokenAmount, ethAmount);
    }

    /**
     * @dev 获取购买指定数量YD代币需要的ETH数量
     */
    function getETHAmount(uint256 tokenAmount) external pure returns (uint256) {
        return tokenAmount / EXCHANGE_RATE;
    }

    /**
     * @dev 获取指定ETH数量可以购买的YD代币数量
     */
    function getTokenAmount(uint256 ethAmount) external pure returns (uint256) {
        return ethAmount * EXCHANGE_RATE;
    }

    /**
     * @dev 合约接收ETH（用于兑换流动性）
     */
    receive() external payable {}

    /**
     * @dev owner可以向合约存入ETH以维持流动性
     */
    function addLiquidity() external payable onlyOwner {}

    /**
     * @dev owner可以提取合约中的ETH
     */
    function withdrawETH(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        payable(owner()).transfer(amount);
    }
}
