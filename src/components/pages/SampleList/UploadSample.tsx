import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box } from 'grommet';
import { SampleDoc } from 'src/db/sample';

interface UploadSampleProps {
  onUploadSample: (docs: SampleDoc[]) => void;
}

const getSampleDataFile = async (file: File): Promise<SampleDoc> => {
  const jsonString = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onabort = () => reject(new Error('file reading was aborted'));
    reader.onerror = () => reject(new Error('file reading has failed'));
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsText(file);
  });
  return JSON.parse(jsonString) as SampleDoc;
};

function UploadSample(props: UploadSampleProps) {
  const { onUploadSample } = props;
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const sampleDocs = await Promise.all(acceptedFiles.map(getSampleDataFile));
    onUploadSample(sampleDocs);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: '.json,application/json'
  });
  return (
    <Box pad="medium" gap="none" width="large" style={{ maxHeight: '90vh', overflowY: 'scroll' }}>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>{`Drag 'n' drop some files here, or click to select files`}</p>
        )}
      </div>
    </Box>
  );
}

export default UploadSample;
