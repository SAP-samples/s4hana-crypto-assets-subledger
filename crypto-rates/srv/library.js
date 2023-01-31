module.exports = {
    getSubscriptions: getSubscriptions ,
    createRoute: createRoute,
    deleteRoute: deleteRoute
};


const httpClient = require('@sap-cloud-sdk/http-client');

async function getSubscriptions(registry) {
    try {
        // get subscriptions
        let res = await httpClient.executeHttpRequest({ destinationName: 'crypto-rates-registry' }, {
            method: 'GET',
            url: '/saas-manager/v1/application/subscriptions'
        });
        return res.data;
    } catch (err) {
        console.log(err.stack);
        return err.message;
    }
};

const k8s = require('@kubernetes/client-node');

async function createRoute(subscribedSubdomain, appName) {
    try {
        let tenantHost = subscribedSubdomain  + '-crypto-rates-app';
        const apiRule = {
            apiVersion: process.env.apiRuleGroup + '/' +  process.env.apiRuleVersion,
            kind: 'APIRule',
            metadata: {
                name: tenantHost,
                labels: {
                    'app.kubernetes.io/managed-by': 'crypto-rates-srv'
                }
            },
            spec: {
                gateway: process.env.gateway,
                host: tenantHost + '.' + process.env.clusterDomain,
                rules: [
                    {
                        path: '/.*',
                        accessStrategies: [
                            {
                                config: {},
                                handler: 'noop'
                            }
                        ],
                        mutators: [
                            {
                                handler: 'header',
                                config: {
                                    headers: {
                                        "x-forwarded-host": tenantHost + '.' + process.env.clusterDomain
                                    }
                                }
                            }
                        ],
                        methods: [
                            'HEAD',
                            'GET',
                            'POST',
                            'PUT',
                            'PATCH',
                            'DELETE'
                        ]
                    }
                ],
                service: {
                    name: process.env.appServiceName,
                    port: parseInt(process.env.appServicePort)
                }
            }
        };
        const kc = new k8s.KubeConfig();
        kc.loadFromCluster();
        const k8sApi = kc.makeApiClient(k8s.CustomObjectsApi);
        const result = await k8sApi.createNamespacedCustomObject(
            process.env.apiRuleGroup,
            process.env.apiRuleVersion,
            process.env.namespace,
            process.env.apiRules,
            apiRule
        );
        console.log('APIRule created:', appName, subscribedSubdomain, tenantHost, result.response.statusCode, result.response.statusMessage);
        return {};
    } catch (err) {
        console.log(err.stack);
        return err.message;
    }
};

async function deleteRoute(subscribedSubdomain, appName) {
    try {
        let tenantHost = subscribedSubdomain  + '-crypto-rates-app';
        const kc = new k8s.KubeConfig();
        kc.loadFromCluster();
        const k8sApi = kc.makeApiClient(k8s.CustomObjectsApi);
        const result = await k8sApi.deleteNamespacedCustomObject(
            process.env.apiRuleGroup,
            process.env.apiRuleVersion,
            process.env.namespace,
            process.env.apiRules,
            tenantHost
        );
        console.log('APIRule deleted:', appName, subscribedSubdomain, tenantHost, result.response.statusCode, result.response.statusMessage);
        return {};
    } catch (err) {
        console.log(err.stack);
        return err.message;
    }
};
