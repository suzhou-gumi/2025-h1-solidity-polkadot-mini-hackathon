
// 合约地址 (部署后需要替换为实际地址)
export const CONTRACT_ADDRESS = "0xb217E6713afcD2E96448a870e1D6f95C47025eE8";

// 合约ABI
export const CONTRACT_ABI = [
    "function createGame(string memory gameId) external payable",
    "function joinGame(string memory gameId) external payable",
    "function endGame(string memory gameId, address winner) external",
    "function cancelGame(string memory gameId) external",
    "function getGameInfo(string memory gameId) external view returns (address creator, address challenger, uint256 totalStake, bool isActive)",
    "event GameCreated(string gameId, address creator, uint256 stakeAmount)",
    "event PlayerJoined(string gameId, address challenger, uint256 stakeAmount)",
    "event GameCompleted(string gameId, address winner, uint256 prize)"
];
