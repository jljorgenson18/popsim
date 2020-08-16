import React, { useState, useEffect } from 'react';
import { Box, Button, Form, Heading, Select, Grid, Layer, Paragraph } from 'grommet';
import { useFormik } from 'formik';
import * as yup from 'yup';
import memoize from 'lodash/memoize';

import { modelTypes, createSample, SamplePayload, BaseSample } from 'src/db/sample';
import Loading from '../common/Loading';
import Page from '../common/Page';
import { useHistory } from 'react-router-dom';
import FormFieldLabel from '../common/FormFieldLabel';

interface SampleFormProps {}

const parseInitialConditionField = memoize((inputVal: string) => {
  return (inputVal || '')
    .split(',')
    .map(val => (val.trim() ? Number(val.trim()) : null))
    .filter(num => num != null);
});

const getAllSamplePayloadsFromValues = (values: Values): SamplePayload[] => {
  const initialConditionFields = Object.keys(values.initialConditionFields);
  const initialConditionValues = initialConditionFields.reduce<{
    [field: string]: number[];
  }>((mapped, field) => {
    const parsed = parseInitialConditionField(values[field]);
    if (parsed && parsed.length > 0) {
      mapped[field] = parsed;
    }
    return mapped;
  }, {});
  // We need to get the fields this way in case there were blank IC's because of default values
  const initialConditionFieldsWithValues = Object.keys(initialConditionValues);
  const totalPayloadSize = Object.values(initialConditionValues).reduce<number>(
    (totalSize, values) => totalSize * values.length,
    1
  );
  const restOfValues = {
    ...values
  };
  initialConditionFieldsWithValues.forEach(field => delete restOfValues[field]);
  delete restOfValues.initialConditionFields;

  // Generate a sample for each possible combination
  const allPayloads: SamplePayload[] = [];
  for (let mainIdx = 0; mainIdx < totalPayloadSize; mainIdx++) {
    const payload = { ...restOfValues } as any;
    payload.name = `${values.name} (${mainIdx + 1})`;
    payload.group = values.name;
    payload.initialConditionFields = initialConditionFields;
    let currentFieldIdx = mainIdx;
    initialConditionFieldsWithValues.forEach(field => {
      const parsedField = initialConditionValues[field];
      payload[field] = parsedField[currentFieldIdx % parsedField.length];
      currentFieldIdx = Math.floor(currentFieldIdx / parsedField.length);
    });
    allPayloads.push(payload);
  }
  if (allPayloads.length === 1) {
    allPayloads[0].name = values.name;
    allPayloads[0].group = undefined;
  }
  return allPayloads;
};

function InitialConditionField<T extends ReturnType<typeof useFormik>>(props: {
  formik: T;
  label: string;
  name: string;
  required?: boolean;
  help?: string;
  customValidate?: (values: number[]) => string | null;
}) {
  const { formik, label, name, required, help, customValidate } = props;
  const submitted = formik.submitCount > 0;
  useEffect(() => {
    formik.setFieldValue(`initialConditionFields.${name}`, {
      required
    });
    formik.registerField(name, {
      validate: (value: string) => {
        if (required && !value) {
          return 'Required';
        }
        const parsedValue = parseInitialConditionField(value);
        if (required && parsedValue.length === 0) {
          return 'Required';
        }
        if (parsedValue.some(num => Number.isNaN(num))) {
          return 'All values must be numeric';
        }
        if (customValidate) return customValidate(parsedValue);
        return null;
      }
    });
    return () => {
      formik.setFieldValue(`initialConditionFields.${name}`, undefined);
      formik.unregisterField(name);
    };
  }, [name, required]);
  return (
    <FormFieldLabel
      label={label}
      name={name}
      required={required}
      help={help}
      error={(formik.touched[name] || submitted) && formik.errors[name]}
      value={formik.values[name]}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
    />
  );
}

function CommonFields(props: { formik: SampleFormFormik }) {
  const { formik } = props;

  return (
    <>
      <InitialConditionField
        formik={formik}
        label="Bulk Concentration"
        name="Co"
        required
        help="Micromolar"
      />
      <InitialConditionField formik={formik} label="Number of monomers (N)" name="N" required />
    </>
  );
}
function BeckerDoringFields(props: { formik: SampleFormFormik }) {
  const { formik } = props;
  return (
    <>
      <CommonFields formik={formik} />
      <InitialConditionField formik={formik} label="Addition rate constant (a)" name="a" required />
      <InitialConditionField
        formik={formik}
        label="Subtraction rate constant (b)"
        name="b"
        required
      />
      <InitialConditionField
        formik={formik}
        label="Critical nucleus size (nc)"
        name="nc"
        help="Defaults to 2"
        customValidate={values => {
          if (values.some(nc => nc < 2)) {
            return 'Values must be greater than or equal to 2';
          }
          return null;
        }}
      />
      <InitialConditionField
        formik={formik}
        label="Nucleation rate constant (kn)"
        name="kn"
        required
      />
    </>
  );
}

function BeckerDoringCrowderFields(props: { formik: SampleFormFormik }) {
  const { formik } = props;
  return (
    <>
      <CommonFields formik={formik} />
      <InitialConditionField formik={formik} label="Addition rate constant (a)" name="a" required />
      <InitialConditionField
        formik={formik}
        label="Subtraction rate constant (b)"
        name="b"
        required
      />
      <InitialConditionField
        formik={formik}
        label="Critical nucleus size (nc)"
        name="nc"
        help="Defaults to 2"
      />
      <InitialConditionField
        formik={formik}
        label="Nucleation rate constant (kn)"
        name="kn"
        required
      />
      <InitialConditionField
        formik={formik}
        label="Crowder volume fraction (phi)"
        name="phi"
        //help="Defaults to phi = 0"
      />
      <InitialConditionField
        formik={formik}
        label="Monomer radius (r1)"
        name="r1"
        //help="Defaults to r1 = 1"
      />
      <InitialConditionField
        formik={formik}
        label="Crowder radius (rc)"
        name="rc"
        //help="Defaults to rc = 1"
      />
      <InitialConditionField
        formik={formik}
        label="Spherocylinder radius (rsc)"
        name="rsc"
        //help="Defaults to rsc = 1"
      />
    </>
  );
}

// Just here for the types
// const KnowlesFormikFunc = (params: any) => useFormik<KnowlesPayload>(params);
// type KnowlesFormik = ReturnType<typeof KnowlesFormikFunc>;
// function KnowlesFields(props: { formik: KnowlesFormik }) {
//   const { formik } = props;
//   return (
//     <>
//       <InitialConditionField
//         formik={formik}
//         label="Association rate constant (ka)"
//         name="ka"
//         required
//       />
//       <InitialConditionField
//         formik={formik}
//         label="Subtraction rate constant (b)"
//         name="b"
//         required
//       />
//       <InitialConditionField
//         formik={formik}
//         label="Addition rate constant (a)"
//         name="a"
//         help="Defaults to a = ka"
//       />
//       <InitialConditionField
//         formik={formik}
//         label="Critical nucleus size (nc)"
//         name="nc"
//         help="Defaults to 2"
//       />
//       <InitialConditionField
//         formik={formik}
//         label="Nucleation rate constant (kn)"
//         name="kn"
//         help="Defaults to kn = a"
//       />
//     </>
//   );
// }

function SmoluchowskiFields(props: { formik: SampleFormFormik }) {
  const { formik } = props;
  return (
    <>
      <CommonFields formik={formik} />
      <InitialConditionField formik={formik} label="Association (ka)" name="ka" required />
      <InitialConditionField formik={formik} label="Dissociation (kb)" name="kb" required />
      <InitialConditionField
        formik={formik}
        label="Addition (a)"
        name="a"
        help="Defaults to a = ka"
      />
      <InitialConditionField
        formik={formik}
        label="Subtraction (b)"
        name="b"
        help="Defaults to b = kb"
      />
      <InitialConditionField
        formik={formik}
        label="Critical nucleus size (nc)"
        name="nc"
        help="Defaults to 2"
      />
      <InitialConditionField
        formik={formik}
        label="Nucleation rate constant (kn)"
        name="kn"
        help="Defaults to kn = a"
      />
    </>
  );
}

function SmoluchowskiCrowderFields(props: { formik: SampleFormFormik }) {
  const { formik } = props;
  return (
    <>
      <CommonFields formik={formik} />
      <InitialConditionField formik={formik} label="Association (ka)" name="ka" required />
      <InitialConditionField formik={formik} label="Dissociation (kb)" name="kb" required />
      <InitialConditionField
        formik={formik}
        label="Addition (a)"
        name="a"
        help="Defaults to a = ka"
      />
      <InitialConditionField
        formik={formik}
        label="Subtraction (b)"
        name="b"
        help="Defaults to b = kb"
      />
      <InitialConditionField
        formik={formik}
        label="Critical nucleus size (nc)"
        name="nc"
        help="Defaults to 2"
      />
      <InitialConditionField
        formik={formik}
        label="Nucleation rate constant (kn)"
        name="kn"
        help="Defaults to kn = a"
      />
      <InitialConditionField
        formik={formik}
        label="Crowder volume fraction (phi)"
        name="phi"
        //help="Defaults to phi = 0"
      />
      <InitialConditionField
        formik={formik}
        label="Monomer radius (r1)"
        name="r1"
        //help="Defaults to r1 = 1"
      />
      <InitialConditionField
        formik={formik}
        label="Crowder radius (rc)"
        name="rc"
        //help="Defaults to rc = 1"
      />
      <InitialConditionField
        formik={formik}
        label="Spherocylinder radius (rsc)"
        name="rsc"
        //help="Defaults to rsc = 1"
      />
    </>
  );
}

function SmoluchowskiSecondaryFields(props: { formik: SampleFormFormik }) {
  const { formik } = props;
  return (
    <>
      <CommonFields formik={formik} />
      <InitialConditionField formik={formik} label="Association (ka)" name="ka" required />
      <InitialConditionField formik={formik} label="Dissociation (kb)" name="kb" required />
      <InitialConditionField
        formik={formik}
        label="Addition (a)"
        name="a"
        help="Defaults to a = ka"
      />
      <InitialConditionField
        formik={formik}
        label="Subtraction (b)"
        name="b"
        help="Defaults to b = kb"
      />
      <InitialConditionField
        formik={formik}
        label="Critical nucleus size (nc)"
        name="nc"
        help="Defaults to 2"
      />
      <InitialConditionField
        formik={formik}
        label="Secondary nucleus size (n2)"
        name="n2"
        help="Defaults to nc"
      />
      <InitialConditionField
        formik={formik}
        label="Nucleation rate constant (kn)"
        name="kn"
        help="Defaults to kn = a"
      />
      <InitialConditionField
        formik={formik}
        label="Secondary nucleation rate constant (k2)"
        name="k2"
        help="Defaults to kn = 0"
      />
      <InitialConditionField
        formik={formik}
        label="Crowder volume fraction (phi)"
        name="phi"
        //help="Defaults to phi = 0"
      />
      <InitialConditionField
        formik={formik}
        label="Monomer radius (r1)"
        name="r1"
        //help="Defaults to r1 = 1"
      />
      <InitialConditionField
        formik={formik}
        label="Crowder radius (rc)"
        name="rc"
        //help="Defaults to rc = 1"
      />
      <InitialConditionField
        formik={formik}
        label="Spherocylinder radius (rsc)"
        name="rsc"
        //help="Defaults to rsc = 1"
      />
    </>
  );
}

// const MPFormikFunc = (params: any) => useFormik<MPPayload>(params);
// type MPFormik = ReturnType<typeof MPFormikFunc>;
// function MPFields(props: { formik: MPFormik }) {
//   const { formik } = props;
//   return (
//     <>
//       <InitialConditionField formik={formik} label="Association (ka)" name="ka" required />
//       <InitialConditionField formik={formik} label="Dissociation (kb)" name="kb" required />
//       <InitialConditionField
//         formik={formik}
//         label="Addition (a)"
//         name="a"
//         help="Defaults to a = ka"
//       />
//       <InitialConditionField
//         formik={formik}
//         label="Addition (b)"
//         name="b"
//         help="Defaults to b = kb"
//       />
//       <InitialConditionField
//         formik={formik}
//         label="Critical nucleus size (nc)"
//         name="nc"
//         help="Defaults to 2"
//       />
//       <InitialConditionField
//         formik={formik}
//         label="Secondary nucleus size (n2)"
//         name="n2"
//         help="Defaults to nc"
//       />
//       <InitialConditionField
//         formik={formik}
//         label="Nucleation rate constant (kn)"
//         name="kn"
//         help="Defaults to kn = a"
//       />
//       <InitialConditionField
//         formik={formik}
//         label="Secondary nucleation rate constant (k2)"
//         name="k2"
//         help="Defaults to kn = 0"
//       />
//       <InitialConditionField
//         formik={formik}
//         label="Crowder volume fraction (phi)"
//         name="phi"
//         //help="Defaults to phi = 0"
//       />
//       <InitialConditionField
//         formik={formik}
//         label="Monomer radius (r1)"
//         name="r1"
//         //help="Defaults to r1 = 1"
//       />
//       <InitialConditionField
//         formik={formik}
//         label="Crowder radius (rc)"
//         name="rc"
//         //help="Defaults to rc = 1"
//       />
//       <InitialConditionField
//         formik={formik}
//         label="Spherocylinder radius (rsc)"
//         name="rsc"
//         //help="Defaults to rsc = 1"
//       />
//     </>
//   );
// }

function BDNucleationFields(props: { formik: SampleFormFormik }) {
  const { formik } = props;
  return (
    <>
      <CommonFields formik={formik} />
      <InitialConditionField
        formik={formik}
        label="Growth-phase association (ka)"
        name="ka"
        required
      />
      <InitialConditionField
        formik={formik}
        label="Growth-phase dissociation (kb)"
        name="kb"
        required
      />
      <InitialConditionField
        formik={formik}
        label="Nucleation-phase addition rate constant (na)"
        name="na"
        required
      />
      <InitialConditionField
        formik={formik}
        label="Nucleation-phase subtraction rate constant (nb)"
        name="nb"
        required
      />
      <InitialConditionField
        formik={formik}
        label="Secondary nucleation rate constant (k2)"
        name="k2"
      />
      <InitialConditionField
        formik={formik}
        label="Critical nucleus size (nc)"
        name="nc"
        required
        help="Defines nucleation vs growth phase"
      />
      <InitialConditionField
        formik={formik}
        label="Secondary nucleus size (n2)"
        name="n2"
        help="Defines nucleation vs growth phase"
      />
      <InitialConditionField
        formik={formik}
        label="Crowder volume fraction (phi)"
        name="phi"
        //help="Defaults to phi = 0"
      />
      <InitialConditionField
        formik={formik}
        label="Monomer radius (r1)"
        name="r1"
        //help="Defaults to r1 = 1"
      />
      <InitialConditionField
        formik={formik}
        label="Crowder radius (rc)"
        name="rc"
        //help="Defaults to rc = 1"
      />
      <InitialConditionField
        formik={formik}
        label="Spherocylinder radius (rsc)"
        name="rsc"
        //help="Defaults to rsc = 1"
      />
      <InitialConditionField formik={formik} label="Growth-phase addition (a)" name="a" />
      <InitialConditionField formik={formik} label="Growth-phase subtraction (b)" name="b" />
    </>
  );
}

type Values = BaseSample & {
  model: string;
  initialConditionFields: {
    [field: string]: true;
  };
} & {
  [icField: string]: string;
};

const SampleFormSchema = yup.object().shape({
  name: yup.string().max(50, 'Max characters is 50').required('Required'),
  model: yup.string().oneOf(modelTypes).required('Required'),
  tstop: yup.number().required('Required'),
  runs: yup.number().required('Required'),
  ind_runs: yup.number(),
  bins: yup.number(),
  bin_scale: yup.string().oneOf(['log', 'linear'])
});

const SampleFormFormikFunc = (params: any) => useFormik<Partial<Values>>(params);
type SampleFormFormik = ReturnType<typeof SampleFormFormikFunc>;

function SampleForm(props: SampleFormProps) {
  const [creatingSample, setCreatingSample] = useState<
    { creating: false } | { creating: true; message: string }
  >({
    creating: false
  });
  const [showingErrorModal, setShowingErrorModal] = useState<Error | null>(null);
  const [progress, setProgress] = useState<number>(null);
  const history = useHistory();
  async function handleNewSampleSubmit(values: Values) {
    try {
      const payloads = getAllSamplePayloadsFromValues(values);
      console.log('Submitting payloads', payloads);
      const payloadSize = payloads.length;
      const createSampleProgressRatio = 1 / payloadSize;
      for (let idx = 0; idx < payloadSize; idx++) {
        setCreatingSample({
          creating: true,
          message:
            payloadSize === 1
              ? 'Creating sample...'
              : `Creating sample ${idx + 1} of ${payloadSize}...`
        });
        const sampleProgress = idx / payloadSize;
        await createSample(payloads[idx], newProgress => {
          console.log('Creating sample progress', idx, newProgress);
          /**
           * We measure the overall sample progress first, then add the individual sample progress
           * proportional to a single sample progress length
           */
          setProgress(sampleProgress + newProgress * createSampleProgressRatio);
        });
      }
      setCreatingSample({
        creating: false
      });
      setProgress(null);
      history.push('/sample-list');
    } catch (err) {
      setCreatingSample({
        creating: false
      });
      setProgress(null);
      setShowingErrorModal(err);
    }
  }
  const formik = useFormik<Partial<Values>>({
    initialValues: {},
    validationSchema: SampleFormSchema,
    // Assumes that the values are populated correctly
    onSubmit(values: Values) {
      handleNewSampleSubmit(values);
    }
  });
  const submitted = formik.submitCount > 0;
  return (
    <Page data-testid="sampleForm">
      <Heading level={2}>Create New Sample</Heading>
      <Form onSubmit={formik.handleSubmit} style={{ maxWidth: 900, width: '100%' }} noValidate>
        <Grid rows="auto" columns={['1/2', '1/2']} gap="small" fill>
          <FormFieldLabel
            label="Name"
            name="name"
            required
            placeholder="Sample Name"
            error={(formik.touched.name || submitted) && formik.errors.name}
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />

          <FormFieldLabel
            label="Time to stop simulation"
            name="tstop"
            type="number"
            required
            error={(formik.touched.tstop || submitted) && formik.errors.tstop}
            value={formik.values.tstop || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <FormFieldLabel
            label="Runs"
            name="runs"
            type="number"
            required
            error={(formik.touched.runs || submitted) && formik.errors.runs}
            value={formik.values.runs || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />

          <FormFieldLabel
            label="Stored Runs"
            name="ind_runs"
            type="number"
            help="Defaults to 0"
            error={(formik.touched.ind_runs || submitted) && formik.errors.ind_runs}
            value={formik.values.ind_runs || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <FormFieldLabel
            label="Bins"
            name="bins"
            type="number"
            help="Defaults to 100"
            error={(formik.touched.bins || submitted) && formik.errors.bins}
            value={formik.values.bins || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <FormFieldLabel
            label="Bin Scale"
            error={(formik.touched.bin_scale || submitted) && formik.errors.bin_scale}>
            <Select
              id="bin_scale"
              options={['linear', 'log']}
              name="bin_scale"
              onChange={evt => {
                formik.setFieldValue('bin_scale', evt.value as string, true);
              }}
              value={formik.values.bin_scale || ''}></Select>
          </FormFieldLabel>
          <FormFieldLabel
            label="Model"
            htmlFor="model-select"
            style={{ gridArea: 'auto / 1 / auto / 3' }}
            error={(formik.touched.model || submitted) && formik.errors.model}>
            <Select
              id="model-select"
              placeholder="Select a model"
              options={modelTypes}
              name="model"
              onChange={evt => {
                formik.setFieldValue('model', evt.value as string, true);
              }}
              value={formik.values.model || ''}></Select>
          </FormFieldLabel>
          {formik.values.model === 'Becker-Doring' ? <BeckerDoringFields formik={formik} /> : null}
          {formik.values.model === 'BD-crowders' ? (
            <BeckerDoringCrowderFields formik={formik} />
          ) : null}
          {formik.values.model === 'Smoluchowski' ? <SmoluchowskiFields formik={formik} /> : null}
          {formik.values.model === 'BD-nucleation' ? <BDNucleationFields formik={formik} /> : null}
          {formik.values.model === 'Smoluchowski-crowders' ? (
            <SmoluchowskiCrowderFields formik={formik} />
          ) : null}
          {formik.values.model === 'Smoluchowski-secondary-nucleation' ? (
            <SmoluchowskiSecondaryFields formik={formik} />
          ) : null}
          <Box direction="row" gap="medium" gridArea="auto / 1 / auto / 3">
            <Button
              label={'Submit'}
              primary
              gap="small"
              type="submit"
              disabled={!formik.isValid && submitted}></Button>
          </Box>
          <Box gridArea="auto / 1 / auto / 3">
            <Heading level={4} margin={{ bottom: '0px' }}>
              Tips
            </Heading>
            <Paragraph>
              {`For multi-parameter submissions, add multiple model initial condition values by separating numbers with commas. For example, 12,34,56`}
            </Paragraph>
          </Box>
        </Grid>
      </Form>
      {creatingSample.creating ? (
        <Layer position="center" modal responsive={false} animation="fadeIn">
          <Loading message={creatingSample.message} progress={progress} />
        </Layer>
      ) : null}
      {showingErrorModal ? (
        <Layer
          position="center"
          modal
          responsive={false}
          animation="fadeIn"
          onClickOutside={() => setShowingErrorModal(null)}
          onEsc={() => setShowingErrorModal(null)}>
          <Box pad="large">
            <Heading level={3}>Something went wrong</Heading>
            {process.env.NODE_ENV === 'development' ? (
              <Paragraph>{`Error: ${showingErrorModal.message}`}</Paragraph>
            ) : null}
          </Box>
        </Layer>
      ) : null}
    </Page>
  );
}

export default SampleForm;
