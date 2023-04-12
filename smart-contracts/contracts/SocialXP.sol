// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

contract SocialXP {

    address public relay;
    address public treasury;

    constructor(address relay_, address treasury_) {
        relay = relay_;
        treasury = treasury_;
    }

}