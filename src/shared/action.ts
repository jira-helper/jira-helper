import { Container, globalContainer } from 'dioma';
import { loggerToken } from './Logger';

type ActionHandler<Payload extends any[], Result> = (
  this: {
    di: Container;
  },
  ...args: Payload
) => Result;

class Action<Payload extends any[], Result> {
  private name: string;

  private di: Container;

  private handler: ActionHandler<Payload, Result>;

  constructor(payload: {
    name: string;
    handler: (
      this: {
        di: Container;
      },
      ...args: Payload
    ) => Result;
    di: Container;
  }) {
    this.name = payload.name;
    this.di = payload.di;
    this.handler = payload.handler;
  }

  run = (...payload: Payload): Result => {
    const logger = this.di.inject(loggerToken);
    logger.log(`Action ${this.name} started`);

    const logFinished = () => logger.log(`Action ${this.name} finished`);
    const logFailed = (e: any) => logger.log(`Action ${this.name} failed with error ${e.toString()}`, 'error');
    try {
      const result = this.handler.apply(
        {
          di: this.di,
        },
        payload
      );

      const isPromise = (r: any) => r instanceof Promise;
      if (!isPromise(result)) {
        logFinished();
        return result;
      }

      // @ts-expect-error
      return result.then(
        r => {
          logFinished();
          return r;
        },
        (e: any) => {
          logFailed(e);
          throw e;
        }
      );
    } catch (e: any) {
      logFailed(e);
      throw e;
    }
  };
}

export const createAction = <Payload extends any[], Result>(params: {
  name: string;
  handler: ActionHandler<Payload, Result>;
}) => {
  const action = new Action({
    ...params,
    di: globalContainer,
  });
  return action.run;
};
