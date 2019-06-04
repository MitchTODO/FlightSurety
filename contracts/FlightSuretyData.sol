pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    uint256 private registeredCount = 0;

    struct airliner {
      bool registered = false;
      bool hasPaid = false;
      uint256 votes = 0;
    }

    mapping(address => airliner) private registerQue;
    //mapping(address => bool) private isInRegisterQue;

  constructor() public
    {

        contractOwner = msg.sender;
        isInRegisterQue[msg.sender] = true;
        airliner NewAirline;
        NewAirline.registered = true;
        NewAirline.hasPaid = true;
        NewAirline.votes = 0;
        registerQue[msg.sender] = NewAirline;

    }



  function isInQue(address addressToCheck) external returns(bool)
  {
    bool addressFetched = isInRegisterQue[addressToCheck];
    return (addressFetched);
  }

  function getRegistrationCount() external returns(uint256)
    {
      return registeredCount;
    }

  function isRegisterAirline(address addressToCheck) external returns (bool registered,bool hasPaid ,uint256 votes)
    {
      airliner addressFetched = registerQue[addressToCheck];
      return (addressFetched.registered,addressFetched.hasPaid,addressFetched.votes);
    }

  function getCurrentConsieses() external returns (uint256)
  {
    uint256 consieses = registeredCount.div(2);
    return (consieses);
  }


/****contract functions*****/
  //function addAddressToRegistationQue(address addressToMap) external
    // Check if contract is operational
    //{
      // build new data object
      //isInRegisterQue[addressToMap] = true;
      //airliner newAirline;
      //newAirline.registered = false;
      //newAirline.hasPaid = false;
      //newAirline.votes = 0;
      //registerQue[addressToMap] = newAirline;
    //}


    function changeRegisteration(address addressToRegister,bool registrationState) external
    // check if caller is FlightApp
    {
      registerQue[addressToRegister].registered = registrationState;
      registeredCount.add(1);
    }

    function addVote(address addressToPromote)
    // check if caller id FlightApp
    {
      registerQue[addressToPromote].votes.add(1);
    }

    function payRegistrationFee(address addressThatPaid) payable
    {
      contractOwner.transfer(msg.value);
      registerQue[addressThatPaid].hasPaid = true;
    }

}
