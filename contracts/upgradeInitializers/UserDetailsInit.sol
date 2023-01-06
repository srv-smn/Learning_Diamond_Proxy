// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { UserDetails } from "../facets/UserDetails.sol";


contract UserDetailsInit {    


    function init(address _owner) external {
       UserDetails(address(this))._init(_owner);
    }
}
