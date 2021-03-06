import React, {Component} from 'react'
import MovieMark from '../build/contracts/MovieMark'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'
import { log } from 'util';

const contract = require('truffle-contract');
const movieMark = contract(MovieMark);

const ABI =
	[{
		"constant": false,
		"inputs": [{
			"name": "movieTitle",
			"type": "string"
		},{
			"name": "mark",
			"type": "int256"
		}],
		"name" : "sendNewOpinion",
		"outputs" : [],
		"payable" : false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name" : "getOpinionCount",
		"outputs" : [{
			name: "",
			type: "uint256"
		}],
		"payable" : false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [{
			"name": "index",
			"type": "uint"
		}],
		"name" : "getOpinionMovieTitle",
		"outputs" : [{
			name: "",
			type: "string"
		}],
		"payable" : false,
		"stateMutability": "nonpayable",
		"type": "function"
	}];

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			storageValue: 0,
			web3: null,
			movies: ["Star Wars 8", "Indiana Jones", "Jurassic Park"],
			details: {
				name: "",
				mark: 0
			}
		};

		//this.changeContractValue = this.changeContractValue.bind(this);
        this.addOpinionToContractSigned = this.addOpinionToContractSigned.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.addMark = this.addMark.bind(this);
		this.getDetails = this.getDetails.bind(this);
		this.getPictureUrl = this.getPictureUrl.bind(this);
		this.getOpinionCount = this.getOpinionCount.bind(this);
	}

	componentWillMount() {
		// Get network provider and web3 instance.
		// See utils/getWeb3 for more info.

		getWeb3
		.then(results => {
			this.setState({
				web3: results.web3
			});

			// Instantiate contract once web3 provided.
			this.instantiateContract();
		})
		.catch(() => {
			console.log('Error finding web3.');
		})
	}

	instantiateContract() {
		/*
		 * SMART CONTRACT EXAMPLE
		 *
		 * Normally these functions would be called in the context of a
		 * state management library, but for convenience I've placed them here.
		 */

		//this.changeContractValueSigned(1);
	}

	handleSubmit() {
		//const value = this.state.contractValue;

		//this.changeContractValueSigned(value);
	}

	addMark() {
		const movieName = this.state.movieName;
		const movieMark = this.state.movieMark;

		console.log("Add a mark", movieName, movieMark);

		// TODO: call the contract to save the new mark
        this.addOpinionToContractSigned(movieName, movieMark);
	}

	getDetails(index) {
		const movieName = this.state.movies[index];
		// call contract to get the mark of the movie

		this.setState({
			details: {
				name: movieName,
				mark: 4
			}
		});
	}

	getPictureUrl(movieName) {
		return "./" + movieName.split(' ').join('_').toLowerCase() + ".jpg";
	}

	getOpinionCount() {
		const accountAddress = "0xFD500653d64Ad617BF822B3b036392D135e85FB5"; // Account from metamask or testrpc
		let movieMarkInstance;

		getWeb3.then(results => {
			console.log(results.web3);

			movieMark.setProvider(results.web3.currentProvider);
			movieMark.deployed().then((instance) => {
				console.log(instance);
				movieMarkInstance = instance;

				movieMarkInstance.getOpinionCount.call(accountAddress).then(function (result) {
					console.log("normalReturn"); // "initResolve"
					console.log(result.c[0]); // "initResolve"
					console.log("Retour opinion count", result);
					//this.setState({storageValue: result.c[0]})
					//return this.setState({ storageValue: result.c[0] })
				}.bind(this));

			});
		});
	}

    addOpinionToContractSigned(name, mark) {
		const Tx = require('ethereumjs-tx');
		let movieMarkInstance;

		const contractAddress = "0x8b07afe04c982c24168db13b9d5e98b98002b8c8"; // Get contract address after exec truffle compile and truffle migrate

		// Account data
		const accountAddress = "0xFD500653d64Ad617BF822B3b036392D135e85FB5"; // Account from metamask or testrpc
		const accountSecret = "7bde9eb616efbd450c0573180b68b4be083b491c2518ee6e6e253dba9bd79ca2"; // Private key from metamask or testrpc
		const privateKey = Buffer.from(accountSecret, 'hex');

		getWeb3.then(results => {
			console.log(results.web3);

			movieMark.setProvider(results.web3.currentProvider);
			movieMark.deployed().then((instance) => {
				console.log(instance);
				movieMarkInstance = instance;


				/*const ABI =
					[{
						"constant": false,
						"inputs": [{"name": "x", "type": "uint256"}],
						"name": "set",
						"outputs": [],
						"payable": false,
						"stateMutability": "nonpayable",
						"type": "function"
					}, {
						"constant": true, "inputs": [], "name": "get", "outputs": [{
							"name": "", "type": "uint256"
						}], "payable": false, "stateMutability": "view", "type": "function"
					}];*/

				const _ = require('lodash');
				const SolidityFunction = require('web3/lib/web3/function');
				const solidityFunction = new SolidityFunction('', _.find(ABI, {name: 'sendNewOpinion'}), '');
				console.log('This shows what toPayload expects as an object');
				console.log(solidityFunction);

				const data = [ name, parseInt(mark) ];
				console.log(data);

				// Get payload data
				const payloadData = solidityFunction.toPayload(data).data;

				console.log("Solidity data: " + payloadData);

				// Gas settings
				const gasPrice = results.web3.eth.gasPrice;
				const gasPriceHex = results.web3.toHex(gasPrice);
				const gasLimitHex = results.web3.toHex(4612388);
				console.log('Current gasPrice: ' + gasPrice + ' OR ' + gasPriceHex);

				// Nonce settings
				const nonce = results.web3.eth.getTransactionCount(accountAddress);
				const nonceHex = results.web3.toHex(nonce);
				console.log('nonce (transaction count on accountAddress): ' + nonce + '(' + nonceHex + ')');

				// Create transaction
				const rawTx = {
					nonce: nonceHex,
					gasPrice: gasPriceHex,
					gasLimit: gasLimitHex,
					to: contractAddress,
					from: accountAddress,
					value: '0x00',
					data: payloadData
				};

				console.log('Rawtx: ' + JSON.stringify(rawTx));

				// Sign transaction
				const tx = new Tx(rawTx);
				tx.sign(privateKey);

				// Send transaction
				const serializedTx = tx.serialize();

				console.log(serializedTx);

				// var self = this;
				results.web3.eth.sendRawTransaction("0x" + serializedTx.toString('hex'), function (err, hash) {
					if (err) {
						console.log('Error:');
						console.log(err);
					}
					else {
						console.log('Transaction receipt hash pending');
						console.log(hash);


						//console.log(movieMarkInstance.getOpinionCount.call(accountAddress));

						movieMarkInstance.getOpinionCount.call(accountAddress).then(function (result) {
							console.log("normalReturn"); // "initResolve"
							console.log(result.c[0]); // "initResolve"
							console.log("Retour opinion count", result);
							//this.setState({storageValue: result.c[0]})
							//return this.setState({ storageValue: result.c[0] })
						}.bind(this))
					}
				}.bind(this))
			}).then((result) => {
				console.log(result);
				// Get the value from the contract to prove it worked.
				// return simpleStorageInstance.get.call(accounts[0])
			}).then((result) => {
				console.log(result);
				// Update state with the result.
				//return this.setState({ storageValue: result.c[0] })
			})
		})
    }

	/*changeContractValueSigned(value) {
		const Tx = require('ethereumjs-tx');
		const contract = require('truffle-contract');
		const simpleStorage = contract(SimpleStorageContract);
		let simpleStorageInstance;

		const contractAddress = "0xcfeb869f69431e42cdb54a4f4f105c19c080a601"; // Get contract address after exec truffle compile and truffle migrate

		// Account data
		const accountAddress = "0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1"; // Account from metamask or testrpc
		const accountSecret = "4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d"; // Private key from metamask or testrpc
		const privateKey = Buffer.from(accountSecret, 'hex');

		getWeb3.then(results => {
			this.setState({storageValue: value});

			simpleStorage.setProvider(results.web3.currentProvider);
			simpleStorage.deployed().then((instance) => {
				console.log(instance);
				simpleStorageInstance = instance;

				const ABI =
					[{
						"constant": false,
						"inputs": [{"name": "x", "type": "uint256"}],
						"name": "set",
						"outputs": [],
						"payable": false,
						"stateMutability": "nonpayable",
						"type": "function"
					}, {
						"constant": true, "inputs": [], "name": "get", "outputs": [{
							"name": "", "type": "uint256"
						}], "payable": false, "stateMutability": "view", "type": "function"
					}];

				const _ = require('lodash');
				const SolidityFunction = require('web3/lib/web3/function');
				const solidityFunction = new SolidityFunction('', _.find(ABI, {name: 'set'}), '');
				console.log('This shows what toPayload expects as an object');
				console.log(solidityFunction);

				// Get payload data
				const payloadData = solidityFunction.toPayload([value]).data;

				// Gas settings
				const gasPrice = results.web3.eth.gasPrice;
				const gasPriceHex = results.web3.toHex(gasPrice);
				const gasLimitHex = results.web3.toHex(300000);
				console.log('Current gasPrice: ' + gasPrice + ' OR ' + gasPriceHex);

				// Nonce settings
				const nonce = results.web3.eth.getTransactionCount(accountAddress);
				const nonceHex = results.web3.toHex(nonce);
				console.log('nonce (transaction count on accountAddress): ' + nonce + '(' + nonceHex + ')');

				// Create transaction
				const rawTx = {
					nonce: nonceHex,
					gasPrice: gasPriceHex,
					gasLimit: gasLimitHex,
					to: contractAddress,
					from: accountAddress,
					value: '0x00',
					data: payloadData
				};

				// Sign transaction
				const tx = new Tx(rawTx);
				tx.sign(privateKey);

				// Send transaction
				const serializedTx = tx.serialize();

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

						simpleStorageInstance.get.call(accountAddress).then(function (result) {
							console.log("normalReturn"); // "initResolve"
							console.log(result.c[0]); // "initResolve"
							this.setState({storageValue: result.c[0]})
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
	}*/

	handleChange(event) {
		this.setState({[event.target.name]: event.target.value});
	}

	render() {
		const component = this;

		let stars = [];
		for (let i = 0; i < 5; i++) {
			if (i < this.state.details.mark) {
				stars.push(<span key={i} className="glyphicon glyphicon-star" aria-hidden="true" style={{fontSize: "2em"}}></span>);
			} else {
				stars.push(<span key={i} className="glyphicon glyphicon-star-empty" aria-hidden="true" style={{fontSize: "2em"}}></span>);
			}
		}

		return (
			<div className="App">
				<nav className="navbar navbar-default navbar-fixed-top pure-menu pure-menu-horizontal" style={{height: "40px"}}>
					<a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
				</nav>

				<div className="container">
					<div className="row" style={{height: "calc(100% - 40px)"}}>
						<div className="col-md-5" style={{border: "1px solid blue"}}>
							<h1>Liste des films</h1>
							<div className="list-group" style={{height: "100%", overflow: "auto"}}>
								{
									this.state.movies.map(function(movieTitle, index) {
										return (
											<button key={index} type="button" className="list-group-item" onClick={component.getDetails.bind(this, index)}>
												<div className="row">
													<div className="col-md-10">
														<h3>{movieTitle}</h3>
													</div>
													<div className="col-md-2" style={{textAlign: "right"}}>
														<img src={component.getPictureUrl(movieTitle)} className="img-thumbnail img-responsive"/>
													</div>
												</div>
											</button>
										)
									})
								}
							</div>
							<div className="row">
								<div className="col-md-3">
									<span className="glyphicon glyphicon-plus" aria-hidden="true" style={{fontSize: "8em"}}></span>
								</div>
								<div className="col-md-6">
									<fieldset>
										<h1>Ajouter une note</h1>
										<div className="form-group">
											<input type="text" name="movieName" className="form-control" placeholder="Nom" onChange={this.handleChange} />
										</div>
										<div className="form-group">
											<input type="number" name="movieMark" className="form-control" min="0" max="5" placeholder="Note" onChange={this.handleChange} />
										</div>
										<button type="button" className="btn btn-primary" onClick={this.addMark}>Ok</button>
										<button type="button" className="btn btn-secondary" onClick={this.getOpinionCount}>Get count</button>
									</fieldset>
								</div>
							</div>
						</div>
						<div className="col-md-7" style={{border: "1px solid red"}}>
							<h1>Détails d'un film</h1>
							<div className="row">
								<div className="col-md-3">
									<img src={component.getPictureUrl(this.state.details.name)} className="img-thumbnail img-responsive" />
								</div>
								<div className="col-md-9">
									<div className="row">
										<h3>{this.state.details.name}</h3>
									</div>
									<div className="row">
										{stars}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default App
