var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Airlines', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);


  });
  it("check operational status", async function(){
    let result = await config.flightSuretyApp.isOperational.call({from:accounts[1]});
    console.log(result);
  })
  
  it('Checking if Contract Owner is a registered airline', async function () {
    let contractowner = accounts[0];
    let result = await config.flightSuretyApp.isRegisterAirline.call(contractowner,{from:contractowner});
    assert.equal(result.registered,true,"Contract Owner is not registered as a airline");
  });

  it('Can register a address from a registered account', async function () {
    let contractowner = accounts[0];
    let bobAirlines = accounts[20];
    let reg_fee = await config.flightSuretyApp.AirlineRegistrationFee.call();
    let price = web3.utils.fromWei(reg_fee)
    let result = await config.flightSuretyApp.isRegisterAirline.call(bobAirlines,{from:bobAirlines});
    await config.flightSuretyApp.promoteAddressFromRegistration(bobAirlines,{from:contractowner});
    await config.flightSuretyApp.payRegistrationFee({from:bobAirlines, value:reg_fee})
    result = await config.flightSuretyApp.isRegisterAirline.call(bobAirlines,{from:bobAirlines});
    assert.equal(result.registered,true,"BobAirlines is not registered");
  });

  it('Showing consensus by registering 5 address from a registered account', async function () {
    let contractowner = accounts[0];
    let airlineAddress = accounts.splice(1, 5);
    let reg_fee = await config.flightSuretyApp.AirlineRegistrationFee.call();
    // add 5 registered address (registered must include fee)
    for(let a = 0; a < airlineAddress.length; a++){
      
      await config.flightSuretyApp.promoteAddressFromRegistration(airlineAddress[a],{from:contractowner});
      await config.flightSuretyApp.payRegistrationFee({from:airlineAddress[a], value:reg_fee});
    }
    let result = await config.flightSuretyApp.isRegisterAirline.call(airlineAddress[airlineAddress.length - 1]);
    assert.equal(result.registered,false,"5th airline is registered should, be false")
    assert.equal(result.votes,1,"5th airline has no votes, should be 1");

    for(let b = 0; b < airlineAddress.length; b++){
      result = await config.flightSuretyApp.isRegisterAirline.call(airlineAddress[b]);
      if (result.registered == true){
        await config.flightSuretyApp.promoteAddressFromRegistration(airlineAddress[airlineAddress.length - 1],{from:airlineAddress[b]});
      }
      
    }
    result = await config.flightSuretyApp.isRegisterAirline.call(airlineAddress[airlineAddress.length - 1]);

    assert.equal(result.registered,true,"5th airline is not registered should, be true");
    assert.equal(result.votes,5,"5th airline has no votes, should be above consensus");
  });

  it('Registering a flight ', async function () {
    let contractowner = accounts[0];
    let airline = "0xf17f52151EbEF6C7334FAD080c5704D77216b732";

    result = await config.flightSuretyApp.isRegisterAirline.call(airline);
    const flight = "ND1521";
    const timestamp = Math.floor(Date.now() / 1000);
    await config.flightSuretyApp.registerFlight(flight,timestamp,200,{from:airline});
    result = await config.flightSuretyApp.getFlightStatus.call(flight,timestamp,airline);
    assert.equal(result[0], true, "Flight does not exist");
  });
});
