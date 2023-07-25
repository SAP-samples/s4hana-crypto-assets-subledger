#!/bin/bash
# Run like this  .  ./setenv.sh to externalize the vars
export LND_TLS_CERT=$(cat ~/.bos/ragnar/credentials.json | jq -r '.cert')
export LND_MACAROON=$(cat ~/.bos/ragnar/credentials.json | jq -r '.macaroon')
export LND_GRPC_HOST=$(cat ~/.bos/ragnar/credentials.json | jq -r '.socket')

# export LND_TLS_CERT=$(cat ~/.bos/ragnarx/credentials.json | jq -r '.cert')
# export LND_MACAROON=$(cat ~/.bos/ragnarx/credentials.json | jq -r '.macaroon')
# export LND_GRPC_HOST=$(cat ~/.bos/ragnarx/credentials.json | jq -r '.socket')

# export LND_TLS_CERT=$(cat ~/.bos/umbrelpi/credentials.json | jq -r '.cert')
# export LND_MACAROON=$(cat ~/.bos/umbrelpi/credentials.json | jq -r '.macaroon')
# export LND_GRPC_HOST=$(cat ~/.bos/umbrelpi/credentials.json | jq -r '.socket')

echo "test with 'echo \$LND_GRPC_HOST'"

nvm use v18.5.0