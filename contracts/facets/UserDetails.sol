// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { PersonalDetailsLib } from "./PersonalDetails.sol";
import { ProfessionalDetailsLib } from "./ProfessionalDetails.sol"; 

// Diamond Storage
library UserDetailsLib {
    // storage slot to store the variables
    bytes32 constant DIAMOND_STORAGE_POSITION = keccak256("diamond.standard.test.user_details");

    // storage variables to be used in our contracts
    struct TestState {
        address owner;
        bool isInit;
    }

    // assign storage slot
    function diamondStorage() internal pure returns (TestState storage ds) {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }

    // all internals function for those data variables
    function setOwner(address _owner) internal {
        // Diamond storage variables
        TestState storage testState = diamondStorage(); 
        testState.owner = _owner;
    }


}

contract Modifiers{

     modifier onlyOwner() {
        UserDetailsLib.TestState storage testState = UserDetailsLib.diamondStorage(); 
        require(msg.sender== testState.owner,'only owner can call');
         _;
   }

   modifier isInit() {
        UserDetailsLib.TestState storage testState = UserDetailsLib.diamondStorage(); 
        require(testState.isInit == false,'already initilised');
         _;
        testState.isInit = true;
   }

}

contract UserDetails is Modifiers {

    // sharing functions and variable from faucets to faucets
    function setUserDetails(string calldata _name, uint _age, string memory _companyName) public {
        PersonalDetailsLib.setMyName(_name);
        PersonalDetailsLib.setMyAge(_age);
        ProfessionalDetailsLib.TestState storage professionalDetails = ProfessionalDetailsLib.diamondStorage();
        professionalDetails.companyName = _companyName;
    }

    function getUserDetails() public view returns(string memory _name, uint _age, string memory _companyName, uint _salary){
        ProfessionalDetailsLib.TestState storage professionalDetails = ProfessionalDetailsLib.diamondStorage();
        return (PersonalDetailsLib.getMyName(), PersonalDetailsLib.getMyAge(), professionalDetails.companyName, professionalDetails.salary);
    }

    function setUserSalary(uint _salary) onlyOwner public {
        ProfessionalDetailsLib.TestState storage professionalDetails = ProfessionalDetailsLib.diamondStorage();
        professionalDetails.salary = _salary;
    }

    // init function to be initialised at the time of diamont cut
    function _init(address _owner) isInit public {
        UserDetailsLib.setOwner(_owner);
    } 
}