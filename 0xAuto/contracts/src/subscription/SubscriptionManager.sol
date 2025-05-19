// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol"; // For potential future use with PointsToken

/**
 * @title SubscriptionManager
 * @dev Manages user subscriptions to services.
 *      Users can subscribe by paying a fee (ETH or potentially ERC20 tokens in the future).
 *      Subscriptions have a fixed duration.
 */
contract SubscriptionManager is Ownable, ReentrancyGuard {
    struct SubscriptionTier {
        uint256 price; // Price in ETH (or token units if using ERC20)
        uint32 duration; // Duration in seconds
        bool isActive;
    }

    struct UserSubscription {
        uint256 tierId;
        uint256 subscribedAt;
        uint256 expiresAt;
    }

    // Mapping from tier ID to subscription tier details
    mapping(uint256 => SubscriptionTier) public subscriptionTiers;
    // Mapping from user address to their current subscription details
    mapping(address => UserSubscription) public userSubscriptions;
    // Mapping from user address to their subscription history (optional, for more detailed tracking)
    // mapping(address => UserSubscription[]) public userSubscriptionHistory;

    uint256 public nextTierId;

    event TierCreated(uint256 indexed tierId, uint256 price, uint32 duration);
    event TierUpdated(uint256 indexed tierId, uint256 newPrice, uint32 newDuration, bool isActive);
    event Subscribed(address indexed user, uint256 indexed tierId, uint256 expiresAt);
    event SubscriptionRenewed(address indexed user, uint256 indexed tierId, uint256 newExpiresAt);
    // event SubscriptionCancelled(address indexed user, uint256 indexed tierId); // Future: if cancellation is allowed

    error ZeroAddress();
    error ZeroAmount();
    error ZeroDuration();
    error TierNotActive();
    error TierNotFound();
    error InsufficientPayment();
    error AlreadySubscribed(); // Or handle as renewal

    constructor(address initialOwner) Ownable(initialOwner) {
        nextTierId = 1; // Start tier IDs from 1
    }

    /**
     * @notice Admin function to create a new subscription tier.
     * @param _price Price of the tier in ETH.
     * @param _duration Duration of the subscription in seconds.
     */
    function createTier(uint256 _price, uint32 _duration) external onlyOwner {
        if (_price == 0) revert ZeroAmount();
        if (_duration == 0) revert ZeroDuration();

        uint256 tierId = nextTierId++;
        subscriptionTiers[tierId] = SubscriptionTier({
            price: _price,
            duration: _duration,
            isActive: true
        });
        emit TierCreated(tierId, _price, _duration);
    }

    /**
     * @notice Admin function to update an existing subscription tier.
     * @param _tierId The ID of the tier to update.
     * @param _newPrice The new price for the tier.
     * @param _newDuration The new duration for the tier.
     * @param _isActive Whether the tier should be active.
     */
    function updateTier(uint256 _tierId, uint256 _newPrice, uint32 _newDuration, bool _isActive) external onlyOwner {
        SubscriptionTier storage tier = subscriptionTiers[_tierId];
        if (tier.price == 0 && tier.duration == 0) { // Check if tier was ever initialized
            revert TierNotFound();
        }
        if (_newPrice == 0) {
            revert ZeroAmount();
        }
        if (_newDuration == 0) {
            revert ZeroDuration();
        }

        tier.price = _newPrice;
        tier.duration = _newDuration;
        tier.isActive = _isActive;

        emit TierUpdated(_tierId, _newPrice, _newDuration, _isActive);
    }

    /**
     * @notice Allows a user to subscribe to a specific tier by sending ETH.
     * @param _tierId The ID of the tier to subscribe to.
     */
    function subscribe(uint256 _tierId) external payable nonReentrant {
        SubscriptionTier storage tier = subscriptionTiers[_tierId];
        if (tier.price == 0 && tier.duration == 0) revert TierNotFound();
        if (!tier.isActive) revert TierNotActive();
        if (msg.value < tier.price) revert InsufficientPayment();

        UserSubscription storage currentSubscription = userSubscriptions[msg.sender];
        uint256 newExpiresAt;

        if (currentSubscription.expiresAt > block.timestamp && currentSubscription.tierId == _tierId) {
            // User is renewing an active subscription to the same tier
            newExpiresAt = currentSubscription.expiresAt + tier.duration;
            emit SubscriptionRenewed(msg.sender, _tierId, newExpiresAt);
        } else {
            // New subscription or changing tiers (or expired)
            newExpiresAt = block.timestamp + tier.duration;
            emit Subscribed(msg.sender, _tierId, newExpiresAt);
        }

        userSubscriptions[msg.sender] = UserSubscription({
            tierId: _tierId,
            subscribedAt: block.timestamp,
            expiresAt: newExpiresAt
        });

        // Refund any overpayment
        if (msg.value > tier.price) {
            payable(msg.sender).transfer(msg.value - tier.price);
        }
    }

    /**
     * @notice Checks if a user currently has an active subscription.
     * @param _user The address of the user.
     * @return True if the user has an active subscription, false otherwise.
     */
    function isActiveSubscriber(address _user) external view returns (bool) {
        UserSubscription storage sub = userSubscriptions[_user];
        return sub.expiresAt > block.timestamp && subscriptionTiers[sub.tierId].isActive;
    }

    /**
     * @notice Gets the details of a user's current subscription.
     * @param _user The address of the user.
     * @return tierId The ID of the tier.
     * @return subscribedAt Timestamp of when the subscription started/last renewed.
     * @return expiresAt Timestamp of when the subscription expires.
     */
    function getUserSubscription(address _user) external view returns (uint256 tierId, uint256 subscribedAt, uint256 expiresAt) {
        UserSubscription storage sub = userSubscriptions[_user];
        return (sub.tierId, sub.subscribedAt, sub.expiresAt);
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