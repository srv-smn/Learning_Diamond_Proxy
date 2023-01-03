// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Diamond Storage
library PersonalDetailsLib {
    // storage slot to store the variables
    bytes32 constant DIAMOND_STORAGE_POSITION = keccak256("diamond.standard.test.personal_details");

    // storage variables to be used in our contracts
    struct TestState {
        string name;
        uint256 age;
    }

    // assign storage slot
    function diamondStorage() internal pure returns (TestState storage ds) {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }

    // all internals function for those data variables
    function setMyName(string calldata _myName) internal {
        // Diamond storage variables
        TestState storage testState = diamondStorage(); 
        testState.name = _myName;
    }

    function setMyAge(uint256 _myAge) internal {
        TestState storage testState = diamondStorage();
        testState.age = _myAge;
    }

    function getMyName() internal view returns (string memory) {
        TestState storage testState = diamondStorage();
        return testState.name;
    }

    function getMyAge() internal view returns (uint256) {
        TestState storage testState = diamondStorage();
        return testState.age;
    }
}

contract PersonalDetails {
    event NameSet(string name);
    event AgeSet(uint256 age);

    function setMyName(string calldata _myName) public {
        PersonalDetailsLib.setMyName(_myName);
        emit NameSet(_myName);
    }

    function setMyAge(uint256 _myAge) public {
        PersonalDetailsLib.setMyAge(_myAge);
        emit AgeSet(_myAge);
    }

    function getMyName() public view returns (string memory) {
        return PersonalDetailsLib.getMyName();
    }

    function getMyAge() public view returns (uint256) {
        return PersonalDetailsLib.getMyAge();
    }
}
