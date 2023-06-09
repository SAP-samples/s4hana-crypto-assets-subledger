module.exports = {
	getQuote: getQuote
};

const kr = require('./libkraken');

async function getQuote(marketDataKey) {
    console.log("getQuote: " + marketDataKey + " is not implemented yet!");

    const response = await kr.getKrakenQuote(marketDataKey);
    console.log(`kraken: ${JSON.stringify(response, null, 2)}`); 

    var sats = 1000000;
    sats = response;

	return sats;
}
