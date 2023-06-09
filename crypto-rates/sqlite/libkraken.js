module.exports = {
	getKrakenQuote: getKrakenQuote
};

const key = process.env[`KRAKEN_KEY`];          // export KRAKEN_KEY=$(cat ~/.ex/kraken.json | jq -r '.key')
const secret = process.env[`KRAKEN_SECRET`];    // export KRAKEN_SECRET=$(cat ~/.ex/kraken.json | jq -r '.secret')

// const key          = 'si/1B...xv39L'; // API Key
// const secret       = 'iF6nj...Krg=='; // API Private Key

const KrakenClient = require('kraken-api');
const kraken       = new KrakenClient(key, secret);

async function getKrakenQuote(marketDataKey) {
    console.log("getKrakenQuote: " + marketDataKey + " is not cool yet!");

    const response = await kraken.api('Ticker', { pair : 'XXBTZUSD' });
    console.log(`kraken: ${JSON.stringify(response, null, 2)}`); 
    var sats = parseInt( response.result.XXBTZUSD.a[0], 10 );  ;
    
	return sats;
}
