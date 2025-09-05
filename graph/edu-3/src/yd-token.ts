import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  YDToken as YDTokenContract,
  TokensPurchased as TokensPurchasedEvent,
  TokensSold as TokensSoldEvent,
  Transfer as TransferEvent,
  Approval as ApprovalEvent,
  OwnershipTransferred as OwnershipTransferredEvent
} from "../generated/YDToken/YDToken"
import {
  YDToken,
  TokenPurchase,
  TokenSale,
  TokenTransfer,
  TokenApproval,
  UserTokenBalance
} from "../generated/schema"

// 初始化或获取 YDToken 实体
function getOrCreateYDToken(contractAddress: Bytes): YDToken {
  let token = YDToken.load(contractAddress)
  if (!token) {
    token = new YDToken(contractAddress)
    
    // 调用合约获取基本信息
    let contract = YDTokenContract.bind(contractAddress)
    token.name = contract.name()
    token.symbol = contract.symbol()
    token.decimals = contract.decimals()
    token.totalSupply = contract.totalSupply()
    
    token.save()
  }
  return token
}

// 获取或创建用户余额实体
function getOrCreateUserBalance(userAddress: Bytes): UserTokenBalance {
  let balance = UserTokenBalance.load(userAddress.toHexString())
  if (!balance) {
    balance = new UserTokenBalance(userAddress.toHexString())
    balance.user = userAddress
    balance.balance = BigInt.fromI32(0)
    balance.lastUpdated = BigInt.fromI32(0)
  }
  return balance
}

// 更新用户余额
function updateUserBalance(userAddress: Bytes, contractAddress: Bytes, blockTimestamp: BigInt): void {
  let balance = getOrCreateUserBalance(userAddress)
  let contract = YDTokenContract.bind(contractAddress)
  
  // 获取最新余额
  let currentBalance = contract.balanceOf(userAddress)
  balance.balance = currentBalance
  balance.lastUpdated = blockTimestamp
  
  balance.save()
}

export function handleTokensPurchased(event: TokensPurchasedEvent): void {
  // 确保 YDToken 实体存在
  getOrCreateYDToken(event.address)
  
  // 创建购买记录
  let purchase = new TokenPurchase(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  purchase.buyer = event.params.buyer
  purchase.ethAmount = event.params.ethAmount
  purchase.tokenAmount = event.params.tokenAmount
  purchase.blockNumber = event.block.number
  purchase.blockTimestamp = event.block.timestamp
  purchase.transactionHash = event.transaction.hash

  purchase.save()

  // 更新买家余额
  updateUserBalance(event.params.buyer, event.address, event.block.timestamp)
}

export function handleTokensSold(event: TokensSoldEvent): void {
  // 确保 YDToken 实体存在
  getOrCreateYDToken(event.address)
  
  // 创建销售记录
  let sale = new TokenSale(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  sale.seller = event.params.seller
  sale.tokenAmount = event.params.tokenAmount
  sale.ethAmount = event.params.ethAmount
  sale.blockNumber = event.block.number
  sale.blockTimestamp = event.block.timestamp
  sale.transactionHash = event.transaction.hash

  sale.save()

  // 更新卖家余额
  updateUserBalance(event.params.seller, event.address, event.block.timestamp)
}

export function handleTransfer(event: TransferEvent): void {
  // 确保 YDToken 实体存在
  let token = getOrCreateYDToken(event.address)
  
  // 创建转账记录
  let transfer = new TokenTransfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  transfer.from = event.params.from
  transfer.to = event.params.to
  transfer.value = event.params.value
  transfer.blockNumber = event.block.number
  transfer.blockTimestamp = event.block.timestamp
  transfer.transactionHash = event.transaction.hash

  transfer.save()

  // 更新 totalSupply（如果是mint或burn）
  let contract = YDTokenContract.bind(event.address)
  token.totalSupply = contract.totalSupply()
  token.save()

  // 更新发送方和接收方余额（排除零地址）
  let zeroAddress = Bytes.fromHexString("0x0000000000000000000000000000000000000000")
  
  if (event.params.from != zeroAddress) {
    updateUserBalance(event.params.from, event.address, event.block.timestamp)
  }
  
  if (event.params.to != zeroAddress) {
    updateUserBalance(event.params.to, event.address, event.block.timestamp)
  }
}

export function handleApproval(event: ApprovalEvent): void {
  // 确保 YDToken 实体存在
  getOrCreateYDToken(event.address)
  
  // 创建授权记录
  let approval = new TokenApproval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  approval.owner = event.params.owner
  approval.spender = event.params.spender
  approval.value = event.params.value
  approval.blockNumber = event.block.number
  approval.blockTimestamp = event.block.timestamp
  approval.transactionHash = event.transaction.hash

  approval.save()
}

export function handleYDTokenOwnershipTransferred(event: OwnershipTransferredEvent): void {
  // 这里可以处理 YDToken 的所有权转移事件
  // 目前只是确保 token 实体存在
  getOrCreateYDToken(event.address)
}