import { SamplePayload } from 'src/db/sample';

import { simulate } from './main';

const ctx: Worker = self as any;

export interface PostMessageData<B = any> {
  messageId: string;
  type: 'getSampleData';
  body: B;
}

const respondToMain = (originalMessage: PostMessageData, responseBody: any) => {
  ctx.postMessage({
    messageId: originalMessage.messageId,
    type: originalMessage.type,
    body: responseBody
  });
};

ctx.addEventListener('message', evt => {
  if (!evt.data) return;
  const messageData = evt.data as PostMessageData;
  if (messageData.type === 'getSampleData') {
    respondToMain(messageData, simulate(messageData.body as SamplePayload));
  }
});

export default {} as typeof Worker & { new (): Worker };
