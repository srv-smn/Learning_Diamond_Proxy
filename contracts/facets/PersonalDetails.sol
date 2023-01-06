// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/AppStorage.sol";

contract PersonalDetails {
    AppStorage internal s;

    event NameSet(string name);
    event AgeSet(uint256 age);

    function setMyName(string calldata _myName) public {
        s.name = _myName;
        emit NameSet(_myName);
    }

    function setMyAge(uint256 _myAge) public {
        s.age = _myAge;
        emit AgeSet(_myAge);
    }

    function getMyName() public view returns (string memory) {
        return s.name;
    }

    function getMyAge() public view returns (uint256) {
        return s.age;
    }
}