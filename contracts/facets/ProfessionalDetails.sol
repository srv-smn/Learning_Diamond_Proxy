// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Diamond Storage
library ProfessionalDetailsLib {
    // storage slot to store the variables
    bytes32 constant DIAMOND_STORAGE_POSITION = keccak256("diamond.standard.test.professional_details");

    // storage variables to be used in our contracts
    struct TestState {
        string companyName;
        uint256 salary;
    }

    // assign storage slot
    function diamondStorage() internal pure returns (TestState storage ds) {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }
}

contract ProfessionalDetails {
    event CompanyNameSet(string name);
    event SalarySet(uint256 age);

    function setMyCompanyName(string calldata _myCompanyName) public {
        ProfessionalDetailsLib.TestState storage professionalDetails = ProfessionalDetailsLib.diamondStorage();
        professionalDetails.companyName = _myCompanyName;
        emit CompanyNameSet(_myCompanyName);
    }

    function setMySalary(uint256 _mySalary) public {
        ProfessionalDetailsLib.TestState storage professionalDetails = ProfessionalDetailsLib.diamondStorage();
        professionalDetails.salary = _mySalary;
        emit SalarySet(_mySalary);
    }

    function getMyCompanyName() public view returns (string memory) {
        ProfessionalDetailsLib.TestState storage professionalDetails = ProfessionalDetailsLib.diamondStorage();
        return professionalDetails.companyName;
    }

    function getMySalary() public view returns (uint256) {
        ProfessionalDetailsLib.TestState storage professionalDetails = ProfessionalDetailsLib.diamondStorage();
        return professionalDetails.salary;
    }
}
