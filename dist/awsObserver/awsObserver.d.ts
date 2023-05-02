import { MiddlewareObj } from '@middy/core';
import { AwsCallLoggerOptions } from '../types/awsObserver.type';
declare const awsCallLogger: (options: AwsCallLoggerOptions) => MiddlewareObj;
export default awsCallLogger;
