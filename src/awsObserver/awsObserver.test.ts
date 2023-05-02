import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import awsCallLogger from './awsObserver';
import { S3 } from '@aws-sdk/client-s3';

export const awsContext = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'string',
    functionVersion: 'string',
    invokedFunctionArn: 'string',
    memoryLimitInMB: 'string',
    awsRequestId: 'string',
    logGroupName: 'string',
    logStreamName: 'string',
    getRemainingTimeInMillis: () => 100,
    done: () => 'mock',
    fail: () => 'mock',
    succeed: () => 'mock',
  };

describe('awsCallLogger middleware', () => {
  it('should log AWS service calls', async () => {
    const logFunction = jest.fn();
    const handler = middy(async () => {
      const s3 = new S3({});
      const result = await s3.listBuckets({});
      return {
        statusCode: 200,
        body: JSON.stringify(result),
      };
    });

    handler
      .use(httpJsonBodyParser())
      .use(awsCallLogger({ logFunction }));

    await new Promise((resolve, reject) => {
      handler({}, awsContext, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });

    expect(logFunction).toHaveBeenCalledWith('AWS Service Call: S3.listBuckets');
  });
});
