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

    event Deposit(string projectId, uint value, address sender);
    event SetProjectOwner(string projectId, address owner);

    mapping(string => Project) public projects;

    modifier checkProjectId(string calldata projectId_) {
        require(bytes(projectId_).length > 0, 'projectId_ cannot be empty');
        _;
    }

    modifier onlyRelay {
        _checkRelay();
        _;
    }

    function _checkRelay() internal view virtual {
        require(msg.sender == relay, 'caller is not the relay');
    }

    constructor(address payable relay_, address payable treasury_) {
        relay = relay_;
        treasury = treasury_;
    }

    function deposit(string calldata projectId_) payable external checkProjectId(projectId_) {
        uint amount = msg.value;
        require(amount > 0, 'value cannot be 0');
        uint credit = (amount * 90) / 100;
        uint fee = amount - credit;
        relay.transfer(credit);
        treasury.transfer(fee);
        Project storage project = projects[projectId_];
        project.deposit += credit;
        project.depositUpdatedAt = block.timestamp;
        emit Deposit(projectId_, amount, msg.sender);
    }

    function setProjectOwner(string calldata projectId_, address address_) external checkProjectId(projectId_) onlyRelay {
        Project storage project = projects[projectId_];
        require(block.timestamp >= project.ownerUpdatedAt + 24 hours, 'can only update every 24 hours');
        project.owner = address_;
        project.ownerUpdatedAt = block.timestamp;
        emit SetProjectOwner(projectId_, address_);
    }

}