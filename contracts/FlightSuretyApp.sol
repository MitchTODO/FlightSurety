pragma solidity ^0.4.25;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp {
    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)

    FlightSuretyData flightSuretyData;
    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    address private contractOwner;

    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;
        address airline;
    }
    mapping(bytes32 => Flight) private flights;

    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireRegisteredUser(address addressToCheck)
      {
        // check if address is in registerQue mapping
        (bool registered, bool haspaid, uint256 votes) = flightSuretyData.isRegisterAirline(addressToCheck);
        require(registered == true, "Sender is not registered");
        require(haspaid == true,"Sender has not paid registration fee");
        _;
      }

    modifier isAlreadyRegistered(address addressToCheck)
      {
        // add mapping to verify addrress
        require(flightSuretyData.isInQue(addressToCheck) == false, "Address is already in registration que");
        _;
      }

      // Define a modifier that checks if the paid amount is sufficient to cover the price
      modifier paidEnough(uint _price)
      {
        require(msg.value >= _price, "PaySome more");
        _;
      }

      // Define a modifier that checks the price and refunds the remaining balance
      modifier checkValue(uint _price, address addressToFund)
      {
        uint  amountToReturn = msg.value - _price;
        addressToFund.transfer(amountToReturn);
        _;
      }

    constructor(address dataContract) public
    {
        contractOwner = msg.sender;
        flightSuretyData = FlightSuretyData(dataContract);
    }

/*********TOOLS**************/
    function getRegistrationCount() external returns(uint256)
    {
      return flightSuretyData.getRegistrationCount();
    }


     function isRegisterAirline(address addressToCheck) external returns(bool registered,bool hasPaid, uint256 votes)
     {
        return flightSuretyData.isRegisterAirline(addressToCheck);
     }

     function isInQue(address addressToCheck) external returns(bool)
     {
       return flightSuretyData.isInQue(addressToCheck);
     }

/*********Functions**************/

    function promoteAddressFromRegistration(address addressToPromote) external
    // check if contract is operational
    requireRegisteredUser(msg.sender)
    {
      if (flightSuretyData.getRegistrationCount() <= 4){
        flightSuretyData.changeRegisteration(addressToPromote,true);
      }else{
        flightSuretyData.addVote(addressToPromote);
        uint256 consieses = flightSuretyData.getCurrentConsieses();
        (bool registered, bool haspaid, uint256 votes) = flightSuretyData.isRegisterAirline(msg.sender);
        if (consieses >= votes){
          flightSuretyData.changeRegisteration(msg.sender,true);
          }
        }
    }


  function payRegistrationFee() external payable
    paidEnough(10 ether)
    checkValue(10 ether,msg.sender)
    {
      flightSuretyData.payRegistrationFee(msg.sender);
    }



}

contract FlightSuretyData {

  function isInQue(address addressToCheck) external returns(bool);
  function getRegistrationCount() external returns(uint256);
  function isRegisterAirline(address addressToCheck) external returns(bool registered,bool hasPaid, uint256 votes);
  function changeRegisteration(address addressToRegister, bool registrationState);
  function addVote(address addressToPromote);
  function getCurrentConsieses() returns(uint256);
  function payRegistrationFee(address addressThatPaid) payable;
}
