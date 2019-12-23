import registerPromiseWorker from 'promise-worker/register';

// worker = new PromiseWorker(new Worker());

const handleMessage = (data: { method: string; params: any }): void => {
  if (!data) return null;
  const { method, params } = data;

  return null;
};

registerPromiseWorker(handleMessage);
