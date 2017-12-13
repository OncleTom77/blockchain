var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var MovieMark = artifacts.require("./MovieMark.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(MovieMark);
};
