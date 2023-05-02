"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const awsCallLogger = (options) => {
    let proxyCache = {};
    return {
        before: async () => {
            const originalRequire = require;
            function customRequire(module) {
                if (module.startsWith('aws-sdk/clients') || module.startsWith('@aws-sdk/client')) {
                    const client = originalRequire(module);
                    if (client) {
                        const handler = {
                            get: function (target, prop) {
                                if (typeof target[prop] === 'function' && !proxyCache[prop]) {
                                    proxyCache[prop] = new Proxy(target[prop], {
                                        apply: (targetFunction, thisArg, args) => {
                                            var _a;
                                            const operation = prop;
                                            const serviceName = (_a = module.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('-').shift();
                                            options.logFunction(`AWS Service Call: ${serviceName}.${operation}`);
                                            return targetFunction.apply(thisArg, args);
                                        },
                                    });
                                }
                                return proxyCache[prop] || target[prop];
                            },
                        };
                        return new Proxy(client, handler);
                    }
                }
                require = customRequire;
                return originalRequire(module);
            }
            require = customRequire;
        },
        after: async () => {
            proxyCache = {};
        },
    };
};
exports.default = awsCallLogger;
//# sourceMappingURL=awsObserver.js.map