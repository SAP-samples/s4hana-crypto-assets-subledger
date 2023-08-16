module.exports = {
	getQuote: getQuote,
	getQuoteDebug: getQuoteDebug
};

const kr = require('./libkraken');
const en = require('./libeuronext');

async function getQuote(marketDataKey) {
    console.log("getQuote: " + marketDataKey + " is not implemented yet!");

    const response = await kr.getKrakenQuote(marketDataKey);
    console.log(`kraken: ${JSON.stringify(response, null, 2)}`); 

    var sats = 1000000;
    sats = response;

	return sats;
}

async function getQuoteDebug(marketDataKey) {
    console.log("getQuoteDebug: " + marketDataKey + " is not implemented yet!");

    const response = await en.getEuroNextQuote(marketDataKey);
    console.log(`euronext: ${JSON.stringify(response, null, 2)}`); 

	return response;
}
