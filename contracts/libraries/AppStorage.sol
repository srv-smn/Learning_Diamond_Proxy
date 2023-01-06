// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

struct AppStorage {
    // variables for personal details contract
    string name;
    uint256 age;

    // upgrade-1 , variables for professional details
    string companyName;
    uint256 salary;

    // upgrade-2 , variables for persional details
    string homeTown;
}