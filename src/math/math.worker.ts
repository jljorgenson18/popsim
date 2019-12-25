import {
  SamplePayload,
  BeckerDoringPayload,
  KnowlesPayload,
  SmoluchowsiPayload,
  BDNucleationPayload,
  SampleData
} from 'src/db/sample';

const ctx: Worker = self as any;

export interface PostMessageData<B = any> {
  messageId: string;
  type: 'getSampleData';
  body: B;
}

export const getSampleData = (payload: SamplePayload): SampleData => {
  console.log('Getting sample data?', payload);

  const { model } = payload;
  if (model === 'Becker-Doring') {
    // Call Becker-Doring model
    // beckerDoringModel(params as BeckerDoringPayload)
    return [];
  }
  if (model === 'Knowles') {
    // knowlesModel(params as KnowlesPayload)
    return [];
  }
  if (model === 'Smoluchowsi') {
    // smoluchowsiModel(params as SmoluchowsiPayload)
    return [];
  }
  if (model === 'BD-nucleation') {
    // bdNucleationPayload(params as BDNucleationPayload)
    return [];
  }
};

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
    respondToMain(messageData, getSampleData(messageData.body as SamplePayload));
  }
});

export default {} as typeof Worker & { new (): Worker };
