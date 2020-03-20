import { v4 as uuid } from 'uuid';

import Worker, { PostMessageData } from './math.worker';
import { SamplePayload, SampleData } from 'src/db/sample';

const worker = new Worker();

export const getSampleData = async (
  payload: SamplePayload,
  onProgress?: (progress?: number) => void
): Promise<SampleData> => {
  const messageId = uuid();
  const messageData: PostMessageData<SamplePayload> = {
    messageId,
    type: 'getSampleData',
    body: payload
  };
  worker.postMessage(messageData);

  return await new Promise((resolve, reject) => {
    const handleMessage = (evt: MessageEvent) => {
      if (!evt.data) return;
      const response: PostMessageData<SampleData | string> = evt.data;
      if (response.messageId === messageId) {
        if (response.state === 'success') {
          worker.removeEventListener('message', handleMessage);
          resolve(response.body as SampleData);
        } else if (response.state === 'error') {
          worker.removeEventListener('message', handleMessage);
          reject(new Error(response.body as string));
        } else if (response.state === 'pending') {
          if (onProgress) onProgress(response.progress);
        }
      }
    };
    worker.addEventListener('message', handleMessage);
  });
};
