// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { PersonalDetails } from "./PersonalDetails.sol";
import { ProfessionalDetails } from "./ProfessionalDetails.sol"; 
import "../libraries/AppStorage.sol";

contract UserDetails {
    AppStorage internal s;

    modifier onlyOwner() {
        require(msg.sender== s.owner,'only owner can call');
         _;
   }

   modifier isInit() {
        require(s.isInit == false,'already initilised');
         _;
        s.isInit = true;
   }

   // sharing functions and variable from faucets to faucets
    function setUserDetails(string calldata _name, uint _age, string memory _companyName) public {

        PersonalDetails(address(this)).setMyName(_name);
        PersonalDetails(address(this)).setMyAge(_age);
        s.companyName = _companyName;
    }

    function getUserDetails() public view returns(string memory _name, uint _age, string memory _companyName, uint _salary){
       
        return (PersonalDetails(address(this)).getMyName(), PersonalDetails(address(this)).getMyAge(), s.companyName, s.salary);
    }

    function setUserSalary(uint _salary) onlyOwner public {
       
        s.salary = _salary;
    }

    // init function to be initialised at the time of diamont cut
    function _init(address _owner) isInit public {
       s.owner = _owner;
    } 
}

