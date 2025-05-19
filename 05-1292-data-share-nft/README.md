# 版本化数据NFT (Versioned Data NFT)

## 概述

VersionedDataNFT 是一个基于以太坊的智能合约，实现了支持版本控制的NFT数据存储功能。该合约允许用户上传数据（如图片、视频等），并为相同内容的不同上传者维护版本历史记录。

## 主要功能

### 数据上传与版本控制

- 用户可以上传Base64编码的数据（最大24KB）
- 相同内容被不同用户上传时会自动创建新版本
- 每个版本记录上传者地址和时间戳
- 支持多种内容类型（如image/png, video/mp4等）

### 数据管理

- 通过内容哈希(contentHash)唯一标识数据
- 存储数据大小、内容类型等元数据
- 记录所有上传过该内容的地址
- 提供数据预览功能（存储数据首尾部分）

### 查询功能

- 获取NFT当前版本号
- 查询NFT完整信息（元数据、上传历史等）
- 获取特定版本的历史记录
- 查询地址关联的所有NFT

## 技术实现

### 合约继承

- ERC721URIStorage (OpenZeppelin)
- Ownable (OpenZeppelin)

### 主要数据结构

```solidity
struct VersionInfo {
    uint256 versionNumber;  // 版本号
    address uploader;       // 上传者地址
    uint256 timestamp;      // 上传时间戳
    string data;            // 数据预览
}

struct TokenData {
    uint256 currentVersion;  // 当前版本
    bytes32 contentHash;     // 内容哈希
    uint256 createdAt;       // 创建时间
    uint256 lastUpdatedAt;   // 最后更新时间
    string contentType;      // 内容类型
    uint256 dataSize;        // 数据大小(字节)
    address[] allUploaders;  // 所有上传者
}
```

### 事件

- `DataUploaded`: 新数据上传时触发
- `VersionIncremented`: 版本更新时触发

## 使用方法

1. 部署合约

```solidity
constructor(address initialOwner) 
    ERC721("Versioned Data NFT", "VDNFT") 
    Ownable(initialOwner) 
{}
```

2. 上传数据

```solidity
function uploadData(
    string memory base64Data,
    string memory contentType
) public
```

3. 查询数据

```solidity
// 获取当前版本
function getTokenVersion(uint256 tokenId) public view returns (uint256)

// 获取NFT完整信息
function getTokenInfo(uint256 tokenId) public view returns (...)
```

## 安全特性

- 防止零地址转账
- 上传数据大小限制(24KB)
- 内容类型验证
- 所有权验证(仅所有者可查询)

## 应用场景

- 协作内容创作平台
- 数据版本控制系统
- 数字资产溯源
- 多方贡献内容认证

## 许可证

MIT License