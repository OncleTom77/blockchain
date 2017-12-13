var HDWalletProvider = require("truffle-hdwallet-provider");

var infura_apikey = "Zc6UsHwzZjXa5Ny8eJE7";
var mnemonic = "stadium switch million useful lawsuit saddle flame miss choice manual skin mixture";

module.exports = {
  networks: {
    ropsten: {
      provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/"+infura_apikey),
      network_id: 3,
      gas: 4612388
    }
  }
};