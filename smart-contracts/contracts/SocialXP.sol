// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

contract SocialXP {

    address payable public relay;
    address payable public treasury;

    struct Member {
        address memberAddress;
        uint updatedAt;
    }

    struct Project {
        uint deposit;
        uint depositUpdatedAt;

        address owner;
        uint ownerUpdatedAt;

        mapping(string => Member) members;
    }

    event Deposit(string projectId, uint value, address sender);
    event SetProjectOwner(string projectId, address owner);
    event SetProjectMember(string projectId, string memberId, address memberAddress);

    mapping(string => Project) public projects;

    modifier checkProjectId(string calldata projectId_) {
        require(bytes(projectId_).length > 0, 'projectId_ cannot be empty');
        _;
    }

    modifier checkMemberId(string calldata memberId_) {
        require(bytes(memberId_).length > 0, 'memberId_ cannot be empty');
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

    function getProjectMember(string calldata projectId_, string calldata memberId_) external view returns (Member memory member) {
        member = projects[projectId_].members[memberId_];
    }

    function setProjectMember(string calldata projectId_, string calldata memberId_, address address_) external checkProjectId(projectId_) checkMemberId(memberId_) onlyRelay {
        Member storage member = projects[projectId_].members[memberId_];
        require(block.timestamp >= member.updatedAt + 24 hours, 'can only update every 24 hours');
        member.memberAddress = address_;
        member.updatedAt = block.timestamp;
        emit SetProjectMember(projectId_, memberId_, address_);
    }

}