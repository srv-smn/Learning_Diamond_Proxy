// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/AppStorage.sol";

import "./PersonalDetails.sol";

contract PersonalDetailsV1 {

    AppStorage internal s;

    function getMyName() public view returns (string memory) {
       
        return string.concat('Mr ',s.name);
        
    }

    function setMyHomeTown(string calldata _homeTown) public {
        s.homeTown = _homeTown;
    }

    function getMyHomeTown() public view returns (string memory){
        return s.homeTown;
    }
}