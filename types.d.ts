/* eslint-disable no-unused-vars */
declare global {
  type ResultType = 'create' | 'room' | 'connection' | 'close';
  interface Result {
    type: ResultType;
    value: any;
  }
  // Override NodeJS types
  namespace NodeJS {
    type MessageListener = (message: Result, sendHandle: unknown) => void;
    interface Process {
      send?: (
        message: Result,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sendHandle?: any,
        options?:
          | {
              swallowErrors?: boolean | undefined;
            }
          | undefined,
        callback?: ((error: Error | null) => void) | undefined
      ) => boolean;
    }
  }
}

export {};
