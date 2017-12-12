import React, { Component } from 'react'
import SimpleStorageContract from '../build/contracts/SimpleStorage.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null
    }

    this.changeContractValue = this.changeContractValue.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    this.changeContractValueSigned(1);
  }

  handleSubmit() {
    var value = this.state.contractValue;

    this.changeContractValueSigned(value);
  }

  changeContractValue(value) {
    const contract = require('truffle-contract')
    const simpleStorage = contract(SimpleStorageContract)
    simpleStorage.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    var simpleStorageInstance

    this.state.web3.eth.getAccounts((error, accounts) => {
      simpleStorage.deployed().then((instance) => {
        simpleStorageInstance = instance

        // Stores a given value, 5 by default.
        return simpleStorageInstance.set(value, {from: accounts[0]})
      }).then((result) => {
        // Get the value from the contract to prove it worked.
        return simpleStorageInstance.get.call(accounts[0])
      }).then((result) => {
        // Update state with the result.
        return this.setState({ storageValue: result.c[0] })
      })
    });
  }

  changeContractValueSigned(value) {
    const Tx = require('ethereumjs-tx')
    const contract = require('truffle-contract')
    const simpleStorage = contract(SimpleStorageContract)
    var simpleStorageInstance

    var contractAddress = "0xcfeb869f69431e42cdb54a4f4f105c19c080a601";

    // Account data
    var accountAddress = "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1"; // Account from metamask
    var accountSecret = "4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d"; // Private key from metamask
    var privateKey = Buffer.from(accountSecret, 'hex')

    getWeb3
    .then(results => {
      this.setState({ storageValue: value })

      simpleStorage.setProvider(results.web3.currentProvider)
      simpleStorage.deployed().then((instance) => {
        console.log(instance)
        simpleStorageInstance = instance

        var ABI =
        [{"constant":false,"inputs":[{"name":"x","type":"uint256"}],"name":"set","outputs":[],"payable":false,
        "stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"get","outputs":[{"name":"","type"
        :"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]

        var _ = require('lodash');
        var SolidityFunction = require('web3/lib/web3/function');
        var solidityFunction = new SolidityFunction('', _.find(ABI, { name: 'set' }), '');
        console.log('This shows what toPayload expects as an object');
        console.log(solidityFunction)

        // Get payload data
        var payloadData = solidityFunction.toPayload([value]).data;

        // Gas settings
        var gasPrice = results.web3.eth.gasPrice;
        var gasPriceHex = results.web3.toHex(gasPrice);
        var gasLimitHex = results.web3.toHex(300000);
        console.log('Current gasPrice: ' + gasPrice + ' OR ' + gasPriceHex);

        // Nonce settings
        var nonce = results.web3.eth.getTransactionCount(accountAddress) ;
        var nonceHex = results.web3.toHex(nonce);
        console.log('nonce (transaction count on accountAddress): ' + nonce + '(' + nonceHex + ')');

        // Create transaction
        var rawTx = {
          nonce: nonceHex,
          gasPrice: gasPriceHex,
          gasLimit: gasLimitHex,
          to: contractAddress,
          from: accountAddress,
          value: '0x00',
          data: payloadData
        };

        // Sign transaction
        var tx = new Tx(rawTx);
        tx.sign(privateKey);

        // Send transaction
        var serializedTx = tx.serialize();

        // var self = this;
        results.web3.eth.sendRawTransaction(serializedTx.toString('hex'), function (err, hash) {
          if (err) {
            console.log('Error:');
            console.log(err);
          }
          else {
            console.log('Transaction receipt hash pending');
            console.log(hash);
            console.log(simpleStorageInstance.get.call(accountAddress));

            simpleStorageInstance.get.call(accountAddress).then(function(result) {
              console.log("normalReturn"); // "initResolve"
              console.log(result.c[0]); // "initResolve"
              this.setState({ storageValue: result.c[0] })
              //return this.setState({ storageValue: result.c[0] })
            }.bind(this))
          }
        }.bind(this))
      }).then((result) => {
        // Get the value from the contract to prove it worked.
        // return simpleStorageInstance.get.call(accounts[0])
      }).then((result) => {
        // Update state with the result.
        //return this.setState({ storageValue: result.c[0] })
      })
    })
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Good to Go!</h1>
              <p>Your Truffle Box is installed and ready.</p>
              <h2>Smart Contract Example</h2>
              <p>If your contracts compiled and migrated successfully, below will show a stored value of 5 (by default).</p>
              <p>Try changing the value stored on <strong>line 59</strong> of App.js.</p>
              <p>The stored value is: {this.state.storageValue}</p>
              <p>
                Change value :
                <input type="text" id="contractValue" name="contractValue" onChange={this.handleChange}/>
                <button type="button" onClick={this.handleSubmit}>Submit</button>
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App