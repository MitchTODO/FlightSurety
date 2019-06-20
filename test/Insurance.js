var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

contract('Insurance', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);


  });
  it('Getting flight price', async function () {
    let airline = accounts[0];
    let consumer = accounts[1];
    let flightNumber = "ND4231";
    let price = web3.utils.toWei("4");
    let timestamp = Math.floor(Date.now() / 1000);
    await config.flightSuretyApp.registerFlight(flightNumber,timestamp,price,{from:airline});
    let result = await config.flightSuretyApp.getTicketPrice.call(flightNumber,timestamp,airline);


  });



  it('Buying flight Insuance', async function () {
    let airline = accounts[0];
    let consumer = accounts[5];
    let flightNumber = "ND4231";
    let insured = true;
    let price = web3.utils.toWei("4");
    let timestamp = Math.floor(Date.now() / 1000) + 5;
    await config.flightSuretyApp.registerFlight(flightNumber,timestamp,price,{from:airline});
    let result = await config.flightSuretyApp.getTicketPrice.call(flightNumber,timestamp,airline);
    await config.flightSuretyApp.buyTicket(flightNumber,timestamp,airline,insured, {from:consumer,value:result[1]});
    result = await config.flightSuretyApp.isInsured.call(flightNumber,timestamp,airline,{from:consumer});
    assert.equal(result,true,"Consumer faild buying insurance");
  });

  it('Buying flight Insuance then crediting insuance for payout', async function () {
    let airline = accounts[0];
    let consumer = accounts[5];
    let flightNumber = "HJD157";
    let insured = true;
    let price = web3.utils.toWei("4");
    let timestamp = Math.floor(Date.now() / 1000) + 5;
    await config.flightSuretyApp.registerFlight(flightNumber,timestamp,price,{from:airline});
    let result = await config.flightSuretyApp.getTicketPrice.call(flightNumber,timestamp,airline);
    await config.flightSuretyApp.buyTicket(flightNumber,timestamp,airline,insured, {from:consumer,value:result[1]});
    await sleep(6000);
    result = await config.flightSuretyApp.creditAmount.call({from:consumer});
    await config.flightSuretyApp.getCredit(flightNumber,timestamp,airline,{from:consumer});
    result = await config.flightSuretyApp.creditAmount.call({from:consumer});
    price = web3.utils.fromWei(result)
    assert.equal(price,6,"credit about is not correct");
    await config.flightSuretyApp.receiveCredit({from:consumer});
    result = await config.flightSuretyApp.creditAmount.call({from:consumer});
    assert.equal(result,0,"Funds where unsuccessfully");
  });

});
