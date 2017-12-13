var HDWalletProvider = require("truffle-hdwallet-provider");

var infura_apikey = "Zc6UsHwzZjXa5Ny8eJE7";
var mnemonic = "remind relax viable exotic stem income rate tone click speed gown swarm";

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/"+infura_apikey),
      network_id: 3
    }
  }
};