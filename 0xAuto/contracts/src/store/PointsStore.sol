// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {PointsToken} from "../token/PointsToken.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PointsStore
 * @dev Allows users to purchase PointsToken with ETH.
 *      The PointsStore contract must be granted MINTER_ROLE on the PointsToken contract.
 */
contract PointsStore is Ownable, ReentrancyGuard {
    PointsToken public immutable pointsToken;
    uint256 public pointsPerEth; // How many points a user gets for 1 ETH

    event PointsPurchased(address indexed buyer, uint256 ethAmount, uint256 pointsAmount);
    event PriceUpdated(uint256 newPointsPerEth);

    error ZeroAddress();
    error ZeroAmount();
    error ZeroPrice();
    error InsufficientPayment();

    constructor(address initialOwner, address pointsTokenAddress, uint256 initialPointsPerEth) Ownable(initialOwner) {
        if (pointsTokenAddress == address(0)) revert ZeroAddress();
        if (initialPointsPerEth == 0) revert ZeroPrice();

        pointsToken = PointsToken(pointsTokenAddress);
        pointsPerEth = initialPointsPerEth;
    }

    /**
     * @notice Allows the owner to update the price of points.
     * @param _newPointsPerEth The new number of points per ETH.
     */
    function setPointsPerEth(uint256 _newPointsPerEth) external onlyOwner {
        if (_newPointsPerEth == 0) revert ZeroPrice();
        pointsPerEth = _newPointsPerEth;
        emit PriceUpdated(_newPointsPerEth);
    }

    /**
     * @notice Allows users to purchase PointsToken by sending ETH.
     *         The amount of points minted is calculated based on msg.value and pointsPerEth.
     */
    function purchasePoints() external payable nonReentrant {
        if (msg.value == 0) revert InsufficientPayment();
        if (pointsPerEth == 0) revert ZeroPrice(); // Should not happen if constructor and setPointsPerEth are correct

        uint256 pointsToMint = (msg.value * pointsPerEth) / 1 ether;
        if (pointsToMint == 0) revert ZeroAmount(); // e.g. if msg.value is too small

        // The PointsStore contract needs MINTER_ROLE on PointsToken
        // The 'sig' parameter in PointsToken.mintTo is currently unused.
        pointsToken.mintTo(msg.sender, pointsToMint, bytes(""));

        emit PointsPurchased(msg.sender, msg.value, pointsToMint);
    }

    /**
     * @notice Allows the owner to withdraw ETH from this contract.
     * @param to The address to send the ETH to.
     * @param amount The amount of ETH to withdraw.
     */
    function withdrawEth(address payable to, uint256 amount) external onlyOwner nonReentrant {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (address(this).balance < amount) revert InsufficientPayment(); // Using InsufficientPayment for contract balance

        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH_TRANSFER_FAILED");
    }

    // Fallback function to receive ETH
    receive() external payable {}
    fallback() external payable {}
}