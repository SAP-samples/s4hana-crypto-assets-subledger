module.exports = {
	getEuroNextQuote: getEuroNextQuote
};

const axios = require('axios');
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");


// The fees to access the APIs for all asset classes are €267.75/month in 2023 (€283.80/mo from 01 Jan 2024) . 
// If you wish to access the API for a specific asset class only (e.g Equities), the access fees are €133.90/month per asset class in 2023 (€141.95/mo from 01 Jan 2024).
// @DataByEuronext,
// Could you please explain the terms & conditions that apply to the use of the data?
// Best regards,
// Euronext Web Services team

// €141.95 = 0.0053366171 BTC / 10,000 req/month  2,592,000 secs/month 
// Need a calculator to help with pricing model development.

async function getEuroNextQuote(isin) {
    console.log("getEuroNextQuote: " + isin + " is not cool yet!");

    var quoteResponse = "unknown";
    // try {
    //     const response = await axios.post('https://live.euronext.com/en/ajax/getIntradayPrice/' + isin); // isin GG00BMTPK874-XAMS
    //     console.log("getEuroNextQuote: " + JSON.stringify(response,null,2));
    //     return quoteResponse;
    // } catch (error) {
    //     console.error("getEuroNextQuote: " + error);
    //     return quoteResponse;
    // }

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://live.euronext.com/en/ajax/getIntradayPrice/' + isin
        // headers: { 
        //   'Cookie': 'incap_ses_385_2691598=V/IcHQCVjXzwuoSYiMxXBV8A3WQAAAAAK4WB9FKQ3oBj7gPyFHfLXA==; incap_ses_385_2784297=eNBEGlQsRx3TwfaYiMxXBQAu3WQAAAAASGJhPhL35x9gqFkGC1qv/g==; visid_incap_2691598=YkmgR1xPQNq7xs2OUO8jjJ383GQAAAAAQUIPAAAAAADqWbSzG8yqc6T/ep4VpAwd; visid_incap_2784297=xOCjvcgNRnW/XkwIgRcqmpMp3WQAAAAAQUIPAAAAAAD0eS/szJgHabgOhb/kkCcU'
        // }
      };
      
    //   axios.request(config)
    //   .then((response) => {
    //     console.log(JSON.stringify(response.data));
    //     return quoteResponse;
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     return quoteResponse;
    //   });
   
      
    try {
        const response = await axios.request(config);
        // console.log("getEuroNextQuote: " + JSON.stringify(response.data,null,2));
        const parser = new XMLParser();
        let jObj = parser.parse(response.data);

        // This is hacky and should be shunned!  JSON Better!
        console.log("Quote Date: " + jObj.div.div[0]);
        console.log("Quote Price: " + jObj.div.div[1].table.tbody.tr[0].td[1]);
        console.log("getEuroNextQuote: " + JSON.stringify(jObj.div.div[1].table.tbody.tr[0].td,null,2));

        quoteResponse = jObj.div.div[1].table.tbody.tr[0].td[1];
        
        return quoteResponse;
    } catch (error) {
        console.error("getEuroNextQuote: " + error);
        return quoteResponse;
    }

}
