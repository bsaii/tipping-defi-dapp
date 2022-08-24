// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract BuyMeACoffee {
    // Event to emit when a memo is created
    event newMemo(
        address indexed from,
        uint256 timestamp,
        string name,
        string message
    );

    // Memo struct
    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    // List all memos receive from friends
    Memo[] public memos;

    // Address of contract deployer for receiving funds
    address payable owner;

    constructor() {
        owner = payable(msg.sender);
    }

    /**
     * @dev buy a coffee for the contract owner
     * @param _name name of the coffee buyer
     * @param _message a message from the coffee buyer
     */

    function buyCoffee(string memory _name, string memory _message)
        public
        payable
    {
        require(msg.value > 0, "can't buy coffee for 0 eth");

        // success in buying a coffee
        // add a new memo to the list of memos
        memos.push(Memo(msg.sender, block.timestamp, _name, _message));

        // Emit a log event with the new memo
        emit newMemo(msg.sender, block.timestamp, _name, _message);
    }

    /**
     * @dev transfer the entire balance stored on the contract to the owner
     */
    function withdrawTips() public payable {
        require(msg.sender == owner, "only the owner can withdraw tips");
        require(address(this).balance > 0, "can't withdraw 0 eth");
        owner.transfer(address(this).balance);
    }

    /**
     * @dev get all the memos stored on the blockchain
     */
    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }
}
