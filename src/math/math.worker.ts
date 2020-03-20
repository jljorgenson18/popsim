import { SamplePayload } from 'src/db/sample';
import throttle from 'lodash/throttle';
import { simulate } from './main';

const ctx: Worker = self as any;

type PostMessageState = 'pending' | 'success' | 'error';

export interface PostMessageData<B = any> {
  messageId: string;
  type: 'getSampleData';
  body: B;
  state?: 'pending' | 'success' | 'error';
  progress?: number;
}

const respondToMain = (
  originalMessage: PostMessageData,
  responseBody: any,
  state: PostMessageState,
  progress?: number
) => {
  ctx.postMessage({
    messageId: originalMessage.messageId,
    type: originalMessage.type,
    body: responseBody,
    state,
    progress
  });
};

ctx.addEventListener('message', evt => {
  if (!evt.data) return;
  const messageData = evt.data as PostMessageData;
  if (messageData.type === 'getSampleData') {
    let responseBody;
    let state: PostMessageState;
    try {
      responseBody = simulate(
        messageData.body as SamplePayload,
        // Need to throttle it or else the main thread can't keep up
        throttle(progress => {
          respondToMain(messageData, null, 'pending', progress);
        }, 50)
      );
      state = 'success';
    } catch (err) {
      responseBody = err.message;
      state = 'error';
      console.error(err);
    }
    respondToMain(messageData, responseBody, state);
  }
});

export default {} as typeof Worker & { new (): Worker };
