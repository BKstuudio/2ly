/**
 * Created by Sym on 28.11.2023
 *
 * Inspired by the following library: https://github.com/kshshe/ThreadPromises
 */

export class ThreadPromise<T, S extends unknown[]> {

  private readonly parameters: S;
  private onResolve: ((result: T) => void) | null;
  private onReject: ((error: Error) => void) | null;
  private readonly promise: Promise<T>;

  constructor(
    private readonly executor: (resolve: (result: T) => void, reject: (error: Error) => void, ...params: S) => void,
    ...parameters: S
  ) {
    this.parameters = parameters;
    this.onResolve = null;
    this.onReject = null;
    this.promise = new Promise((resolve, reject) => {
      this.onResolve = resolve;
      this.onReject = reject;
    });

    this.start();
  }

  then<R>(handler: (value: T) => Promise<R> | R): Promise<R> {
    return this.promise.then(handler);
  }

  catch<R = never>(handler: (error: Error) => R | Promise<R>): Promise<T | R> {
    return this.promise.catch(handler);
  }

  finally(handler: () => void): Promise<T> {
    return this.promise.finally(handler);
  }

  private start() {
    if (typeof Worker !== "undefined") {
      setTimeout(() => {
        const workerContent = this.getFunctionBody(this.executor.toString());
        const workerURL = URL.createObjectURL(new Blob([workerContent]));
        const worker = new Worker(workerURL);

        worker.addEventListener('message', (event) => {
          const { 'data': data, 'type': type } = event.data;
          URL.revokeObjectURL(workerURL);
          worker.terminate();
          if (type === "done") {
            this.onResolve?.(data);
          } else {
            this.onReject?.(data);
          }
        });

        worker.postMessage({ 'params': this.parameters });
      }, 0);
    } else {
      this.executor(this.onResolve!, this.onReject!, ...this.parameters);
    }
  }

  private getFunctionBody(executor: string): string {
    return `
      function done(data) {
        self.postMessage({ type: "done", data, });
        self.close();
      }
      function fail(data) {
        self.postMessage({ type: "fail", data, });
        self.close();
      }
      self.onmessage = ({ data: { params } }) => {
          (${executor})(done, fail, ...(params ?? []));
      };`;
  }
}