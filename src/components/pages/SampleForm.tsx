import React, { useState } from 'react';
import {
  Box,
  Button,
  Form,
  FormField,
  Heading,
  Select,
  Text,
  Grid,
  Layer,
  Paragraph
} from 'grommet';
import { useFormik } from 'formik';
import {
  SamplePayload,
  modelTypes,
  BeckerDoringPayload,
  SmoluchowskiPayload,
  BDNucleationPayload,
  SmoluchowskiCrowderPayload,
  BeckerDoringCrowderPayload,
  SmoluchowskiSecondaryPayload,
  MPPayload,
  createSample
} from 'src/db/sample';
import Loading, { LoadingProps } from '../common/Loading';
import Page from '../common/Page';
import { useHistory } from 'react-router-dom';

interface SampleFormProps {}

const validate = (values: Partial<SamplePayload>) => {
  const errors: { [fieldName: string]: string } = {};
  if (!values.model) errors.model = 'Required';
  if (!values.name) errors.name = 'Required';
  if (values.N == null) errors.N = 'Required';
  if (values.tstop == null) errors.tstop = 'Required';
  if (values.Co == null) errors.Co = 'Required';
  if (values.model === 'Becker-Doring') {
    if (values.a == null) errors.a = 'Required';
    if (values.b == null) errors.b = 'Required';
  } else if (values.model === 'Smoluchowski') {
    if (values.ka == null) errors.ka = 'Required';
    if (values.kb == null) errors.kb = 'Required';
  } else if (values.model === 'BD-nucleation') {
    if (values.ka == null) errors.ka = 'Required';
    if (values.kb == null) errors.kb = 'Required';
    if (values.na == null) errors.na = 'Required';
    if (values.nb == null) errors.nb = 'Required';
    if (values.nc == null) errors.nc = 'Required';
  }
  if (!errors.nc && values.nc != null && values.nc < 2) {
    errors.nc = 'Must be greater than or equal to 2';
  }
  return errors;
};

const FormFieldLabel = (props: React.ComponentProps<typeof FormField>) => {
  const { required, label, ...rest } = props as any; // TODO, Figure out why this is causing problems
  return (
    <FormField
      label={
        required ? (
          <Box direction="row">
            <Text>{label}</Text>
            <Text color="status-critical">*</Text>
          </Box>
        ) : (
          label
        )
      }
      {...rest}
    />
  );
};

function InitialConditionField<T extends ReturnType<typeof useFormik>>(props: {
  formik: T;
  label: string;
  name: string;
  required?: boolean;
  help?: string;
}) {
  const { formik, label, name, required, help } = props;
  const submitted = formik.submitCount > 0;
  return (
    <FormFieldLabel
      label={label}
      name={name}
      type="number"
      required={required}
      step="any"
      help={help}
      error={(formik.touched[name] || submitted) && formik.errors[name]}
      value={formik.values[name] || ''}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
    />
  );
}

// Just here for the types
const BeckerDoringFormikFunc = (params: any) => useFormik<BeckerDoringPayload>(params);
type BeckerDoringFormik = ReturnType<typeof BeckerDoringFormikFunc>;
function BeckerDoringFields(props: { formik: BeckerDoringFormik }) {
  const { formik } = props;
  return (
    <>
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
    </>
  );
}

const BeckerDoringCrowderFormikFunc = (params: any) =>
  useFormik<BeckerDoringCrowderPayload>(params);
type BeckerDoringCrowderFormik = ReturnType<typeof BeckerDoringCrowderFormikFunc>;
function BeckerDoringCrowderFields(props: { formik: BeckerDoringCrowderFormik }) {
  const { formik } = props;
  return (
    <>
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

// Just here for the types
const SmoluchowsiFormikFunc = (params: any) => useFormik<SmoluchowskiPayload>(params);
type SmoluchowsiFormik = ReturnType<typeof SmoluchowsiFormikFunc>;
function SmoluchowskiFields(props: { formik: SmoluchowsiFormik }) {
  const { formik } = props;
  return (
    <>
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

const SmoluchowsiCrowderFormikFunc = (params: any) => useFormik<SmoluchowskiCrowderPayload>(params);
type SmoluchowskiCrowderFormik = ReturnType<typeof SmoluchowsiCrowderFormikFunc>;
function SmoluchowskiCrowderFields(props: { formik: SmoluchowskiCrowderFormik }) {
  const { formik } = props;
  return (
    <>
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

const SmoluchowsiSecondaryFormikFunc = (params: any) =>
  useFormik<SmoluchowskiSecondaryPayload>(params);
type SmoluchowskiSecondaryFormik = ReturnType<typeof SmoluchowsiSecondaryFormikFunc>;
function SmoluchowskiSecondaryFields(props: { formik: SmoluchowskiSecondaryFormik }) {
  const { formik } = props;
  return (
    <>
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

// Just here for the types
const BDNucleationFormikFunc = (params: any) => useFormik<BDNucleationPayload>(params);
type BDNucleationFormik = ReturnType<typeof BDNucleationFormikFunc>;
function BDNucleationFields(props: { formik: BDNucleationFormik }) {
  const { formik } = props;
  return (
    <>
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

function SampleForm(props: SampleFormProps) {
  const [showingLoadingModal, setShowingLoadingModal] = useState<LoadingProps | null>(null);
  const [showingErrorModal, setShowingErrorModal] = useState<Error | null>(null);
  const history = useHistory();
  async function handleNewSampleSubmit(values: SamplePayload) {
    try {
      setShowingLoadingModal({
        message: 'Creating sample...'
      });
      await createSample(values);
      setShowingLoadingModal(null);
      history.push('/sample-list');
    } catch (err) {
      setShowingLoadingModal(null);
      setShowingErrorModal(err);
    }
  }
  const initialValues: Partial<SamplePayload> = {
    name: ''
  };
  const formik = useFormik({
    initialValues,
    validate,
    // Assumes that the values are populated correctly
    onSubmit(values: SamplePayload) {
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
            label="Number of monomers (N)"
            name="N"
            type="number"
            required
            error={(formik.touched.N || submitted) && formik.errors.N}
            value={formik.values.N || ''}
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
            label="Bulk Concentration"
            name="Co"
            type="number"
            required
            help="Micromolar"
            error={(formik.touched.Co || submitted) && formik.errors.Co}
            value={formik.values.Co || ''}
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
            name="bin_scale"
            type="string"
            help="log or linear (default)"
            placeholder="linear"
            error={(formik.touched.bin_scale || submitted) && formik.errors.bin_scale}
            value={formik.values.bin_scale || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
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
          {formik.values.model === 'Becker-Doring' ? (
            <BeckerDoringFields formik={formik as BeckerDoringFormik} />
          ) : null}
          {formik.values.model === 'BD-crowders' ? (
            <BeckerDoringCrowderFields formik={formik as BeckerDoringCrowderFormik} />
          ) : null}
          {formik.values.model === 'Smoluchowski' ? (
            <SmoluchowskiFields formik={formik as SmoluchowsiFormik} />
          ) : null}
          {formik.values.model === 'BD-nucleation' ? (
            <BDNucleationFields formik={formik as BDNucleationFormik} />
          ) : null}
          {formik.values.model === 'Smoluchowski-crowders' ? (
            <SmoluchowskiCrowderFields formik={formik as SmoluchowskiCrowderFormik} />
          ) : null}
          {formik.values.model === 'Smoluchowski-secondary-nucleation' ? (
            <SmoluchowskiSecondaryFields formik={formik as SmoluchowskiSecondaryFormik} />
          ) : null}
          <Box direction="row" gap="medium" gridArea="auto / 1 / auto / 3">
            <Button
              label={'Submit'}
              primary
              gap="small"
              type="submit"
              disabled={!formik.isValid && formik.submitCount > 0}></Button>
          </Box>
        </Grid>
      </Form>
      {showingLoadingModal ? (
        <Layer position="center" modal responsive={false} animation="fadeIn">
          <Loading message={showingLoadingModal.message} progress={showingLoadingModal.progress} />
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
            <Paragraph>{`Error: ${showingErrorModal.message}`}</Paragraph>
          </Box>
        </Layer>
      ) : null}
    </Page>
  );
}

export default SampleForm;
