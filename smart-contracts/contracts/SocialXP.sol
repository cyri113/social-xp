// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

/*
This is the smart contract for the SocialXP Telegram bot (https://t.me/social_xp_bot). 
The bot provides on-chain rewards for community members. SocialXP is decentralized and 
therefore requires writing to the blockchain, unfortunately, this costs gas. SocialXP 
allows you to load gas credits in order to pay for future transactions. It operates on a 
pay-as-you-go basis. There is a 10% commission that goes to maintaining SocialXP. You can 
reward your members at any time by minting tokens. You can punish your members at any 
time by burning their tokens too.
*/

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SocialXP is Ownable {
    using Counters for Counters.Counter;

    struct FeeStructure {
        uint projectMemberFee;
        uint projectOwnerFee;
        uint mintFee;
        uint burnFee;
    }

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
        Counters.Counter counter;
        mapping(uint => address) accounts;
    }

    mapping(string => Project) public projects;
    mapping(uint => string) private projectIds;

    Counters.Counter counter;

    address payable public relay;
    address payable public treasury;

    FeeStructure public fees =
        FeeStructure({
            projectMemberFee: 100_000,
            projectOwnerFee: 100_000,
            mintFee: 150_000,
            burnFee: 50_000
        });

    event Deposit(string projectId, uint value, address sender);
    event SetProjectOwner(string projectId, address owner);
    event SetProjectMember(string projectId, string memberId, address account);
    event Mint(string projectId, address account, uint amount);
    event Burn(string projectId, address account, uint amount);
    event SetFees(FeeStructure fees);


    modifier checkProjectId(string calldata projectId_) {
        require(bytes(projectId_).length > 0, "projectId_ cannot be empty");
        _;
    }

    modifier checkMemberId(string calldata memberId_) {
        require(bytes(memberId_).length > 0, "memberId_ cannot be empty");
        _;
    }

    modifier checkAddressZero(address account_) {
        require(account_ != address(0), "account_ cannot be address(0)");
        _;
    }

    modifier checkDeposit(string calldata projectId_) {
        require(
            projects[projectId_].deposit >= gasleft(),
            "insufficient deposit"
        );
        _;
    }

    modifier onlyRelay() {
        _checkRelay();
        _;
    }

    function _checkRelay() internal view virtual {
        require(msg.sender == relay, "caller is not the relay");
    }

    constructor(address payable relay_, address payable treasury_) {
        relay = relay_;
        treasury = treasury_;
    }

    function _checkProject(string calldata projectId_) internal view returns (bool) {
        for (uint i = 0; i < counter.current(); i++) {
            if (keccak256(abi.encodePacked(projectIds[i])) == keccak256(abi.encodePacked(projectId_))) return true;
        }
        return false;
    }

    function deposit(
        string calldata projectId_
    ) external payable checkProjectId(projectId_) {
        require(msg.value > 0, "value cannot be 0");
        relay.transfer(msg.value);
        Project storage project = projects[projectId_];
        project.deposit += msg.value;
        project.depositUpdatedAt = block.timestamp;
        emit Deposit(projectId_, msg.value, msg.sender);

        if (!_checkProject(projectId_)) {
            projectIds[counter.current()] = projectId_;
            counter.increment();
        }
    }

    function setProjectOwner(
        string calldata projectId_,
        address account_
    )
        external
        checkProjectId(projectId_)
        checkDeposit(projectId_)
        checkAddressZero(account_)
        onlyRelay
    {
        Project storage project = projects[projectId_];
        require(
            block.timestamp >= project.ownerUpdatedAt + 24 hours,
            "can only update every 24 hours"
        );
        project.owner = account_;
        project.ownerUpdatedAt = block.timestamp;
        emit SetProjectOwner(projectId_, account_);
        project.deposit -= tx.gasprice * fees.projectOwnerFee;
    }

    function getProjectMember(
        string calldata projectId_,
        string calldata memberId_
    ) external view returns (Member memory member) {
        member = projects[projectId_].members[memberId_];
    }

    function setProjectMember(
        string calldata projectId_,
        string calldata memberId_,
        address account_
    )
        external
        checkProjectId(projectId_)
        checkDeposit(projectId_)
        checkMemberId(memberId_)
        checkAddressZero(account_)
        onlyRelay
    {
        Project storage project = projects[projectId_];
        Member storage member = project.members[memberId_];
        require(
            block.timestamp >= member.updatedAt + 24 hours,
            "can only update every 24 hours"
        );
        member.account = account_;
        member.updatedAt = block.timestamp;
        emit SetProjectMember(projectId_, memberId_, account_);
        project.deposit -= tx.gasprice * fees.projectMemberFee;
    }

    function balanceOf(
        string calldata projectId_,
        address account_
    ) external view returns (uint) {
        return projects[projectId_].balanceOf[account_];
    }

    function mint(
        string calldata projectId_,
        address account_,
        uint amount_
    )
        external
        checkProjectId(projectId_)
        checkDeposit(projectId_)
        checkAddressZero(account_)
        onlyRelay
    {
        require(amount_ > 0, "value cannot be 0");
        Project storage project = projects[projectId_];

        if (project.balanceOf[account_] == 0) {
            project.accounts[project.counter.current()] = account_;
            project.counter.increment();
        }

        project.balanceOf[account_] += amount_;
        project.totalSupply += amount_;
        emit Mint(projectId_, account_, amount_);
        project.deposit -= tx.gasprice * fees.mintFee;
    }

    function burn(
        string calldata projectId_,
        address account_,
        uint amount_
    )
        external
        checkProjectId(projectId_)
        checkDeposit(projectId_)
        checkAddressZero(account_)
        onlyRelay
    {
        require(amount_ > 0, "value cannot be 0");
        Project storage project = projects[projectId_];
        require(project.balanceOf[account_] >= amount_, "insufficient balance");
        project.balanceOf[account_] -= amount_;
        project.totalSupply -= amount_;
        emit Burn(projectId_, account_, amount_);

        if (project.balanceOf[account_] == 0 && project.counter.current() > 0) {
            uint idx;
            for (uint i = 0; i < project.counter.current(); i++) {
                if (project.accounts[i] == account_) {
                    idx = i;
                    break;
                }
            }

            if (idx != project.counter.current() - 1) {
                project.accounts[idx] = project.accounts[project.counter.current() - 1];
            }
            delete project.accounts[project.counter.current() - 1];
            project.counter.decrement();
        }
        project.deposit -= tx.gasprice * fees.burnFee;
    }

    function position(
        string calldata projectId_,
        address account_
    ) external view returns (uint _position) {
        Project storage project = projects[projectId_];
        uint accountBalance = project.balanceOf[account_];
        _position = 1;

        for (uint i = 0; i < project.counter.current(); i++) {
            address addr = project.accounts[i];
            if (addr == account_) continue; // skip current account
            if (project.balanceOf[addr] > accountBalance) {
                _position++;
            }
        }
    }

    function sort(
        string calldata projectId_
    )
        external
        view
        returns (address[] memory accounts, uint[] memory balances)
    {
        Project storage project = projects[projectId_];

        uint len = project.counter.current();
        accounts = new address[](len);
        balances = new uint[](len);

        for (uint i = 0; i < len; i++) {
            accounts[i] = project.accounts[i];
            balances[i] = project.balanceOf[accounts[i]];
        }
        quickSort(accounts, balances, 0, len - 1);
    }

    function quickSort(
        address[] memory accounts_,
        uint[] memory balances_,
        uint left_,
        uint right_
    ) internal view {
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

    function setFees(FeeStructure calldata fees_) external onlyOwner {
        fees = fees_;
        emit SetFees(fees_);
    }

    function sum() external view returns (uint amount) {
        for (uint i = 0; i < counter.current(); i++) {
            string memory projectId = projectIds[i];
            Project storage project = projects[projectId];
            amount += project.deposit;
        }
    }
}
