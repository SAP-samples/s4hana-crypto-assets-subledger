module.exports = {
	getNodeInfo: getNodeInfo
};

const {authenticatedLndGrpc} = require('ln-service');
const {getWalletInfo} = require('ln-service');
const {getInvoices} = require('ln-service');
const {createInvoice} = require('ln-service');

// Edit /Users/i830671/.bos/ragnar/credentials.json etc.

const cert = process.env[`LND_TLS_CERT`];       // export LND_TLS_CERT=$(cat ~/.bos/ragnar/credentials.json | jq -r '.cert')
const macaroon = process.env[`LND_MACAROON`];   // export LND_MACAROON=$(cat ~/.bos/ragnar/credentials.json | jq -r '.macaroon')
const socket = process.env[`LND_GRPC_HOST`];    // export LND_GRPC_HOST=$(cat ~/.bos/ragnar/credentials.json | jq -r '.socket')

// echo $LND_TLS_CERT
// echo $LND_MACAROON
// echo $LND_GRPC_HOST

// lncli --rpcserver=IP_ADDRESS:GRPC_PORT --tlscertpath=./../tls.cert --macaroonpath=./../admin.macaroon

// GLOBAL OPTIONS:
//    --rpcserver value          The host:port of LN daemon. (default: "localhost:10009")
//    --tlscertpath value        The path to lnd's TLS certificate. (default: "/Users/i830671/Library/Application Support/Lnd/tls.cert")
//    --no-macaroons             Disable macaroon authentication.
//    --macaroonpath value       The path to macaroon file.

// ./lncli --rpcserver=ragnar:10009 --tlscertpath=./tls.cert --macaroonpath=./admin.macaroon getinfo
// base64 -w0 admin.macaroon

// Create a new LND gRPC API client
// const lnd = lnService.authenticatedLndGrpc({
//   cert: './tls.cert', // scp ragnar:/t4/lnd/tls.cert .
//   macaroon: './admin.macaroon', // scp ragnar:/t4/lnd/data/chain/bitcoin/mainnet/admin.macaroon .
//   socket: 'ragnar:10009'
// })

let lnd;
try {
    lnd = authenticatedLndGrpc({ cert, macaroon, socket }).lnd;
} catch (err) {
    throw new Error('FailedToInstantiateDaemon');
}
 
// https://github.com/alexbosworth/ln-service#all-methods

// Get info about the Lightning node
async function getNodeInfo() {
    try {
        const walletInfo = await getWalletInfo({ lnd });
        // console.log(`info: ${JSON.stringify(walletInfo, null, 2)}`);
        console.log(`lightning node: ${JSON.stringify(walletInfo.alias, null, 2)}`);
        console.log(`peers_count: ${JSON.stringify(walletInfo.peers_count, null, 2)}`);
        console.log(`public_key: ${JSON.stringify(walletInfo.public_key, null, 2)}`);
        return walletInfo;
    } catch (err) {
        console.error(`Error getting node info: ${err.message}`)
    }
}
