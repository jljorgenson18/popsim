import { v4 as uuid } from 'uuid';

import Worker, { PostMessageData } from './math.worker';
import { SamplePayload, SampleData } from 'src/db/sample';

const worker = new Worker();

export const getSampleData = async (payload: SamplePayload): Promise<SampleData> => {
  const messageId = uuid();
  const messageData: PostMessageData<SamplePayload> = {
    messageId,
    type: 'getSampleData',
    body: payload
  };
  worker.postMessage(messageData);

  return await new Promise(resolve => {
    const handleMessage = (evt: MessageEvent) => {
      if (!evt.data) return;
      const response: PostMessageData<SampleData> = evt.data;
      if (response.messageId === messageId) {
        worker.removeEventListener('message', handleMessage);
        resolve(response.body as SampleData);
      }
    };
    worker.addEventListener('message', handleMessage);
  });
};
