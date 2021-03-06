import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Heading, Paragraph } from 'grommet';

import Page from '../common/Page';
import { SampleDocWithData, cloneSample } from 'src/db/sample';
import { useHistory } from 'react-router-dom';

interface UploadSamplesProps {}

const getSampleDataFile = async (file: File): Promise<SampleDocWithData> => {
  const jsonString = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onabort = () => reject(new Error('file reading was aborted'));
    reader.onerror = () => reject(new Error('file reading has failed'));
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsText(file);
  });
  return JSON.parse(jsonString) as SampleDocWithData;
};

function UploadSamples(props: UploadSamplesProps) {
  const history = useHistory();
  async function handleUploadSamples(uploadedSamples: SampleDocWithData[]) {
    console.log('Uploading samples...');
    await Promise.all(uploadedSamples.map(doc => cloneSample(doc)));
    console.log('Samples uploaded!!');
    history.push('/sample-list');
  }
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const sampleDocs = await Promise.all(acceptedFiles.map(getSampleDataFile));
    handleUploadSamples(sampleDocs);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: '.json,application/json'
  });
  return (
    <Page align="center">
      <Heading level={2}>Upload Samples</Heading>
      <Box
        {...getRootProps()}
        border
        pad="large"
        round="medium"
        elevation="small"
        width="medium"
        direction="column"
        align="center">
        <input {...getInputProps()} />
        {isDragActive ? (
          <Paragraph>Drop the files here ...</Paragraph>
        ) : (
          <Paragraph>{`Drag 'n' drop some files here, or click to select files`}</Paragraph>
        )}
      </Box>
    </Page>
  );
}

export default UploadSamples;
