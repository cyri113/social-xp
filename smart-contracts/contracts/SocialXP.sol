// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

contract SocialXP {

    address payable public relay;
    address payable public treasury;

    mapping(string => uint) public deposits;

    constructor(address payable relay_, address payable treasury_) {
        relay = relay_;
        treasury = treasury_;
    }

    function deposit(string calldata chatId_) payable external {
        uint amount = msg.value;
        uint credit = (amount * 90) / 100;
        uint fee = amount - credit;
        relay.transfer(credit);
        treasury.transfer(fee);
        deposits[chatId_] += credit;
    }

}