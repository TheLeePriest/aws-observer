import { MiddlewareObj } from '@middy/core';
import {AwsCallLoggerOptions} from '../types/awsObserver.type'

const awsCallLogger = (options: AwsCallLoggerOptions): MiddlewareObj => {
  let proxyCache: { [key: string]: any } = {};

  return {
    before: async () => {
      const originalRequire = require;

      function customRequire(module: string): any {
        if (module.startsWith('aws-sdk/clients') || module.startsWith('@aws-sdk/client')) {
          const client = originalRequire(module);

          if (client) {
            const handler = {
              get: function (target: any, prop: string) {
                if (typeof target[prop] === 'function' && !proxyCache[prop]) {
                  proxyCache[prop] = new Proxy(target[prop], {
                    apply: (targetFunction, thisArg, args) => {
                      const operation = prop;
                      const serviceName = module.split('/').pop()?.split('-').shift();
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

        require = customRequire as NodeRequire;

        return originalRequire(module);
      }

      require = customRequire as NodeRequire;
    },
    after: async () => {
      proxyCache = {};
    },
  };
};

export default awsCallLogger;
