pragma solidity ^0.4.0;

contract Chainergy {

    // Toutes les cartes des producteurs
    EnergyCard[] energyCards;

    // Acteur du smart contract (Producteur ou Consommateur)
    struct Actor {
        address owner;
        Localisation localisation;
    }

    // Carte de Producteur
    struct EnergyCard {
        uint quantity;
        uint price;
        Actor producer;
        uint nbContracts;
        mapping (uint => EnergyContract) contracts;
    }

    // Contrat de consommation conclut entre un Producteur et un Consommateur
    struct EnergyContract {
	    uint quantity;
	    uint price;
	    Actor consumer;
    }

    // Localisation géographique d'un acteur
    struct Localisation {
        uint x;
        uint y;
    }

    // Un Producteur ajoute une carte
    function addEnergyCard(uint quantity, uint price, uint x, uint y) public {
        require(quantity > 0);
        require(price > 0);

        Localisation memory loc = Localisation(x, y);
        Actor memory producer = Actor(msg.sender, loc);
        EnergyCard memory newCard = EnergyCard(quantity, price, producer, 0);
        energyCards.push(newCard);
    }

    // Un Consommateur peut souscrire un contrat avec un Producteur
    function contractEnergyCard(uint index, uint quantity, uint x, uint y) public {
        EnergyCard storage card = energyCards[index];
        uint consumedQty = getCurrentConsumedQuantity(index);

        require(index >= 0);
        require(quantity > 0);
        require(card.quantity <= consumedQty + quantity);

        Localisation memory loc = Localisation(x, y);
        Actor memory consumer = Actor(msg.sender, loc);
        uint price = card.price + getDistancePrice(x, y, card.producer.localisation.x, card.producer.localisation.y);
        EnergyContract memory energyContract = EnergyContract(quantity, price, consumer);

        card.contracts[card.nbContracts++] = energyContract;
    }

    function getDistancePrice(uint x1, uint y1, uint x2, uint y2) public returns(uint) {
        return 1 * getDistance(x1, y1, x2, y2);
    }

    function getDistance(uint x1, uint y1, uint x2, uint y2) public returns(uint) {
        return sqrt(exp(x2 - x1, 2) + exp(y2 - y1, 2));
    }

    // Retourne la quantité actuelle d'énergie consommée d'une carte de producteur
    function getCurrentConsumedQuantity(uint index) public returns(uint) {
        EnergyCard storage card = energyCards[index];
        uint result = 0;

        for(uint i = 0; i < card.nbContracts; i++) {
            result += card.contracts[i].quantity;
        }

        return result;
    }
    
    function exp(uint nb, uint exponent) returns(uint) {
        uint res = nb;

        if (exponent == 0) {
            return 1;
        }

        for (uint i = 1; i < exponent; i++) {
            res *= nb;
        }

        return res;
    }

    function sqrt(uint x) returns (uint y) {
        uint z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}