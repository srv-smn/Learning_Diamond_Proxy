// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/AppStorage.sol";

contract ProfessionalDetails {
    AppStorage internal s;

    event CompanyNameSet(string name);
    event SalarySet(uint256 age);

    function setMyCompanyName(string calldata _myCompanyName) public {
        s.companyName = _myCompanyName;
        emit CompanyNameSet(_myCompanyName);
    }

    function setMySalary(uint256 _mySalary) public {
        s.salary = _mySalary;
        emit SalarySet(_mySalary);
    }

    function getMyCompanyName() public view returns (string memory) {
        return s.companyName;
    }

    function getMySalary() public view returns (uint256) {
        return s.salary;
    }
}