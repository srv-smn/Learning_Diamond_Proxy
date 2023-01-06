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
        // new vatiable
        string homeTown;
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

    function setMyHomeTown(string calldata _homeTown) internal {
        // Diamond storage variables
        TestState storage testState = diamondStorage(); 
        testState.homeTown = _homeTown;
    }

    function getMyName() internal view returns (string memory) {
        TestState storage testState = diamondStorage();
        return testState.name;
    }

    function getMyAge() internal view returns (uint256) {
        TestState storage testState = diamondStorage();
        return testState.age;
    }

     function getMyHomeTown() internal view returns (string memory) {
        TestState storage testState = diamondStorage();
        return testState.homeTown;
    }
}

contract PersonalDetailsV1 {

    function getMyName() public view returns (string memory) {
        return string.concat('Mr ',PersonalDetailsLib.getMyName());
        //return PersonalDetailsLib.getMyName();
    }

    function setMyHomeTown(string calldata _homeTown) public {
        PersonalDetailsLib.setMyHomeTown(_homeTown);
    }

    function getMyHomeTown() public view returns (string memory){
        return PersonalDetailsLib.getMyHomeTown();
    }
}
