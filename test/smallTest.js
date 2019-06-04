var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    //console.log(config.flightSuretyData)
    //await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  it('CASE 1', async function () {
    let contractowner = accounts[0]
    let bobAirline = accounts[1]
    let aliceAirline = accounts[2]
    console.log("Adding bobAirline to registration");
    await config.flightSuretyApp.addAddressToRegistationQue({from:bobAirline});
    result = await config.flightSuretyApp.isInQue.call(bobAirline,{from:bobAirline});
    assert.equal(result,true,"BOB is not in registrationQue")
    console.log("Adding aliceAirline to registration");
    //await config.flightSuretyApp.addAddressToRegistationQue({from:aliceAirline});
    //result = await config.flightSuretyApp.isInQue.call(aliceAirline,{from:aliceAirline});
    //assert.equal(result,true,"Alice is not in registrationQue");

    console.log("Promote bobAirline from contractowner")
    await config.flightSuretyApp.promoteAddressFromRegistration(bobAirline, {from:contractowner});

    console.log("BobAirlines paying registration fee")
    const registationFee = web3.utils.toWei('10', "ether")
    await config.flightSuretyApp.payRegistrationFee({from:bobAirline,value:registationFee})

    result = await config.flightSuretyApp.isRegisterAirline.call(bobAirline,{from:bobAirline});
    //console.log(result)
    assert.equal(result[0],true,"BobAirline is registered")
    assert.equal(result[1],true,"BobAirline fee is paid")

    console.log("Promote AliceAirline from BobAirline")
    await config.flightSuretyApp.promoteAddressFromRegistration(aliceAirline, {from:bobAirline});

    result = await config.flightSuretyApp.isRegisterAirline.call(aliceAirline,{from:aliceAirline});
    console.log(result)



  });


});
