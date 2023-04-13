// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "hardhat/console.sol";

contract SocialXP {

    address payable public relay;
    address payable public treasury;

    struct Member {
        address account;
        uint updatedAt;
    }

    struct Project {
        uint deposit;
        uint depositUpdatedAt;

        address owner;
        uint ownerUpdatedAt;

        mapping(string => Member) members;
        mapping(address => uint) balanceOf;

        uint totalSupply;

        uint counter;
        mapping(uint => address) accounts;
    }

    event Deposit(string projectId, uint value, address sender);
    event SetProjectOwner(string projectId, address owner);
    event SetProjectMember(string projectId, string memberId, address account);
    event Mint(string projectId, address account, uint amount);
    event Burn(string projectId, address account, uint amount);

    mapping(string => Project) public projects;

    modifier checkProjectId(string calldata projectId_) {
        require(bytes(projectId_).length > 0, 'projectId_ cannot be empty');
        _;
    }

    modifier checkMemberId(string calldata memberId_) {
        require(bytes(memberId_).length > 0, 'memberId_ cannot be empty');
        _;
    }
    
    modifier checkAddressZero(address account_) {
        require(account_ != address(0), 'account_ cannot be address(0)');
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

    function setProjectOwner(string calldata projectId_, address account_) external checkProjectId(projectId_) checkAddressZero(account_) onlyRelay {
        Project storage project = projects[projectId_];
        require(block.timestamp >= project.ownerUpdatedAt + 24 hours, 'can only update every 24 hours');
        project.owner = account_;
        project.ownerUpdatedAt = block.timestamp;
        emit SetProjectOwner(projectId_, account_);
    }

    function getProjectMember(string calldata projectId_, string calldata memberId_) external view returns (Member memory member) {
        member = projects[projectId_].members[memberId_];
    }

    function setProjectMember(string calldata projectId_, string calldata memberId_, address account_) external checkProjectId(projectId_) checkMemberId(memberId_) checkAddressZero(account_) onlyRelay {
        Member storage member = projects[projectId_].members[memberId_];
        require(block.timestamp >= member.updatedAt + 24 hours, 'can only update every 24 hours');
        member.account = account_;
        member.updatedAt = block.timestamp;
        emit SetProjectMember(projectId_, memberId_, account_);
    }

    function balanceOf(string calldata projectId_, address account_) external view returns (uint) {
        return projects[projectId_].balanceOf[account_];
    }

    function mint(string calldata projectId_, address account_, uint amount_) external checkProjectId(projectId_) checkAddressZero(account_) onlyRelay {
        require(amount_ > 0, 'value cannot be 0');
        Project storage project = projects[projectId_];

        if (project.balanceOf[account_] == 0) {
            project.accounts[project.counter] = account_;
            project.counter++;
        }

        project.balanceOf[account_] += amount_;
        project.totalSupply += amount_;
        emit Mint(projectId_, account_, amount_);

    }

    function burn(string calldata projectId_, address account_, uint amount_) external checkProjectId(projectId_) checkAddressZero(account_) onlyRelay {
        require(amount_ > 0, 'value cannot be 0');
        Project storage project = projects[projectId_];
        require(project.balanceOf[account_] >= amount_, 'insufficient balance');
        project.balanceOf[account_] -= amount_;
        project.totalSupply -= amount_;
        emit Burn(projectId_, account_, amount_);

        if (project.balanceOf[account_] == 0 && project.counter > 0) {
            uint idx;
            for (uint i = 0; i < project.counter; i++) {
                if (project.accounts[i] == account_) {
                    idx = i;
                    break;
                }
            }

            if (idx != project.counter - 1) {
                project.accounts[idx] = project.accounts[project.counter - 1];
            }
            delete project.accounts[project.counter - 1];
            project.counter--;
        }
    }

    function position(string calldata projectId_, address account_) external view returns (uint _position) {
        Project storage project = projects[projectId_];
        uint accountBalance = project.balanceOf[account_];
        _position = 1;

        for (uint i = 0; i < project.counter; i++) {
            address addr = project.accounts[i];
            if (addr == account_) continue; // skip current account
            if (project.balanceOf[addr] > accountBalance) {
                _position++;
            }
        }
    }

    function sort(string calldata projectId_) external view returns (address[] memory accounts, uint[] memory balances) {
        Project storage project = projects[projectId_];

        uint len = project.counter;
        accounts = new address[](len);
        balances = new uint[](len);

        for (uint i = 0; i < len; i++) {
            accounts[i] = project.accounts[i];
            balances[i] = project.balanceOf[accounts[i]];
        }
        quickSort(accounts, balances, 0, len - 1);
    }

    function quickSort(address[] memory accounts_, uint[] memory balances_, uint left_, uint right_) internal view {
        if (left_ < right_) {
            uint pIdx = uint(left_ + (right_ - left_) / 2);
            uint pVal = balances_[pIdx];
            uint i = left_;
            uint j = right_;
            while (i <= j) {
                while (balances_[i] > pVal) i++;
                while (balances_[j] < pVal) j--;
                if (i < j) {
                    (accounts_[i], accounts_[j]) = (accounts_[j], accounts_[i]);
                    (balances_[i], balances_[j]) = (balances_[j], balances_[i]);
                    i++;
                    j--;
                }
                if (left_ < j) quickSort(accounts_, balances_, left_, j);
                if (right_ > i) quickSort(accounts_, balances_, i, right_);
            }
        }
    }

}