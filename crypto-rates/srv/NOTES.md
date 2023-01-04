kubectl get secret crypto-rates-uaa-binding-secret -o json | jq --arg port "8001" -r '{"PORT": $port, "NODE_ENV": "production", "VCAP_SERVICES": { "xsuaa": { 
"zone": .data.zoneid,
"xsapp": .data.xsappname 
} } }'z

kubectl get secret crypto-rates-uaa-binding-secret -o json | jq --arg port "8001" -r '.data|map_values(@base64d) | { "PORT": $port, "NODE_ENV": "production", "VCAP_SERVICES": { "xsuaa": [{"credentials": . , "instance_guid": .instance_guid, "instance_name": .instance_name, "label": .label, "plan": .plan, "tags": [.label], "volume_mounts": []}] } }'

