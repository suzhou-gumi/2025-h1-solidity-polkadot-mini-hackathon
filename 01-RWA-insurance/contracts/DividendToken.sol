// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DividendToken is ERC20, Ownable {
    struct Policy {
        uint256 policyId;
        address policyHolder;
        uint256 premium;
        uint256 coverageAmount;
        uint256 startDate;
        uint256 endDate;
        bool isActive;
        bool isClaimed;
    }

    uint256 public policyCount;
    mapping(uint256 => Policy) public policies;
    mapping(address => uint256[]) public policyHolders;

    event PolicyCreated(uint256 policyId, address policyHolder, uint256 premium, uint256 coverageAmount, uint256 startDate, uint256 endDate);
    event PremiumPaid(uint256 policyId, address policyHolder, uint256 amount);
    event ClaimProcessed(uint256 policyId, address policyHolder, uint256 amount);
    event DividendsDistributed(uint256 amount);

    constructor() ERC20("DividendToken", "DIV") {
        // Initialize the ERC20 token with a name and symbol
    }

    function createPolicy(uint256 _premium, uint256 _coverageAmount, uint256 _startDate, uint256 _endDate) public onlyOwner {
        require(_startDate < _endDate, "Start date must be before end date");
        policyCount++;
        policies[policyCount] = Policy(policyCount, msg.sender, _premium, _coverageAmount, _startDate, _endDate, true, false);
        policyHolders[msg.sender].push(policyCount);
        emit PolicyCreated(policyCount, msg.sender, _premium, _coverageAmount, _startDate, _endDate);
    }

    function payPremium(uint256 _policyId) public payable {
        Policy storage policy = policies[_policyId];
        require(policy.policyHolder == msg.sender, "Only policy holder can pay premium");
        require(policy.isActive, "Policy is not active");
        require(msg.value == policy.premium, "Incorrect premium amount");
        emit PremiumPaid(_policyId, msg.sender, msg.value);
    }

    function processClaim(uint256 _policyId) public {
        Policy storage policy = policies[_policyId];
        require(policy.policyHolder == msg.sender, "Only policy holder can claim");
        require(policy.isActive, "Policy is not active");
        require(!policy.isClaimed, "Policy already claimed");
        require(block.timestamp >= policy.startDate && block.timestamp <= policy.endDate, "Policy is not in effect");

        policy.isClaimed = true;
        policy.isActive = false;
        payable(policy.policyHolder).transfer(policy.coverageAmount);
        emit ClaimProcessed(_policyId, msg.sender, policy.coverageAmount);
    }

    function distributeDividends(uint256 _amount) public onlyOwner {
        require(totalSupply() > 0, "No tokens minted");
        uint256 dividendPerToken = _amount / totalSupply();
        for (uint256 i = 0; i < totalSupply(); i++) {
            address tokenHolder = address(uint160(i));
            uint256 holderBalance = balanceOf(tokenHolder);
            if (holderBalance > 0) {
                payable(tokenHolder).transfer(holderBalance * dividendPerToken);
            }
        }
        emit DividendsDistributed(_amount);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function getPoliciesByHolder(address _holder) public view returns (uint256[] memory) {
        return policyHolders[_holder];
    }
}
