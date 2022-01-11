// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract Lottery {
    address public manager;
    address[] public players;
    uint randomSeed = 1;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value >= 1 ether, "Minimum payment requirement is not satisfied!");
        
        for(uint i = 0; i < players.length; i++) {
            require(!(players[i] == msg.sender), "This player is already in the game");
        }

        players.push(msg.sender);
    }

    function random() private returns (uint) {
        randomSeed++; 
        return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randomSeed)));            
    }

    function pickWinner() public restricted returns(uint[3] memory) {
        require(address(this).balance > 99 ether, "Stake isn't big enough!");

        uint indexOfFirstWinner = random() % players.length;

        uint indexOfSecondWinner = random() % players.length;
        while(indexOfFirstWinner == indexOfSecondWinner) {
            indexOfSecondWinner = random() % players.length;
        }

        uint indexOfThirdWinner = random() % players.length;
        while(indexOfThirdWinner == indexOfSecondWinner || indexOfThirdWinner == indexOfSecondWinner) {
            indexOfThirdWinner = random() % players.length;
        }

        payable(players[indexOfFirstWinner]).transfer(50 ether);
        payable(players[indexOfSecondWinner]).transfer(20 ether);
        payable(players[indexOfThirdWinner]).transfer(10 ether);
        payable(manager).transfer(address(this).balance);
        players = new address[](0);

        randomSeed = 1;
        return [indexOfFirstWinner, indexOfSecondWinner, indexOfThirdWinner];
    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    function getPlayers() public view returns(address[] memory) {
        return players;
    }

    function getBalance() public restricted view returns (uint) {
        return address(this).balance;
    }
}