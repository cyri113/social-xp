// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

contract SocialXP {

    address payable public relay;
    address payable public treasury;

    struct Project {
        uint deposit;
        uint depositUpdatedAt;

        address owner;
        uint ownerUpdatedAt;
    }

    mapping(string => Project) public projects;

    modifier onlyRelay {
        _checkRelay();
        _;
    }

    function _checkRelay() internal view virtual {
        require(msg.sender == relay, 'Caller is not the relay');
    }

    constructor(address payable relay_, address payable treasury_) {
        relay = relay_;
        treasury = treasury_;
    }

    function deposit(string calldata projectId_) payable external {
        uint amount = msg.value;
        uint credit = (amount * 90) / 100;
        uint fee = amount - credit;
        relay.transfer(credit);
        treasury.transfer(fee);
        Project storage project = projects[projectId_];
        project.deposit += credit;
        project.depositUpdatedAt = block.timestamp;
    }

    function setProjectOwner(string calldata projectId_, address address_) external onlyRelay {
        Project storage project = projects[projectId_];
        require(block.timestamp >= project.ownerUpdatedAt + 25 hours, 'Can only update every 24 hours');
        project.owner = address_;
        project.ownerUpdatedAt = block.timestamp;
    }

}