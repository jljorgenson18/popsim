import React from 'react';
import { Box, Button, Form, FormField, Heading, Select, Text, Grid } from 'grommet';
import { useFormik } from 'formik';
import {
  SamplePayload,
  modelTypes,
  BeckerDoringPayload,
  SmoluchowskiPayload,
  BDNucleationPayload
} from 'src/db/sample';

interface SampleFormProps {
  onCancel: () => void;
  onSubmit: (payload: SamplePayload) => void;
}

const validate = (values: Partial<SamplePayload>) => {
  const errors: { [fieldName: string]: string } = {};
  if (!values.model) {
    errors.model = 'Required';
  }
  if (!values.name) {
    errors.name = 'Required';
  }
  if (values.N == null) {
    errors.N = 'Required';
  }
  if (values.tstop == null) {
    errors.tstop = 'Required';
  }
  if (values.model === 'Becker-Doring') {
    if (values.a == null) {
      errors.a = 'Required';
    }
    if (values.b == null) {
      errors.b = 'Required';
    }
  }
  // else if (values.model === 'Knowles') {
  //   if (values.ka == null) {
  //     errors.ka = 'Required';
  //   }
  //   if (values.b == null) {
  //     errors.b = 'Required';
  //   }
  //   return errors;
  // }
  else if (values.model === 'Smoluchowski') {
    if (values.ka == null) {
      errors.kb = 'Required';
    }
    if (values.kb == null) {
      errors.kb = 'Required';
    }
  } else if (values.model === 'BD-nucleation') {
    if (values.ka == null) {
      errors.ka = 'Required';
    }
    if (values.kb == null) {
      errors.kb = 'Required';
    }
    if (values.na == null) {
      errors.na = 'Required';
    }
    if (values.nb == null) {
      errors.nb = 'Required';
    }
    if (values.nc == null) {
      errors.nc = 'Required';
    }
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
      help={help}
      error={(formik.touched[name] || submitted) && formik.errors[name]}
      value={formik.values[name] || ''}
      onChange={formik.handleChange}
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
        label="Addition (b)"
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
        label="Critical nucleus size (nc)"
        name="nc"
        required
        help="Defines nucleation vs growth phase"
      />
      <InitialConditionField formik={formik} label="Growth-phase addition (a)" name="a" />
      <InitialConditionField formik={formik} label="Growth-phase addition (b)" name="b" />
    </>
  );
}

function SampleForm(props: SampleFormProps) {
  const { onSubmit, onCancel } = props;
  const initialValues: Partial<SamplePayload> = {
    name: ''
  };
  const formik = useFormik({
    initialValues,
    validate,
    // Assumes that the values are populated correctly
    onSubmit(values: SamplePayload) {
      onSubmit(values);
    }
  });
  const submitted = formik.submitCount > 0;
  return (
    <Box
      pad="medium"
      gap="none"
      width="large"
      style={{ maxHeight: '90vh', overflowY: 'scroll' }}
      data-testid="sampleForm">
      <Form onSubmit={formik.handleSubmit}>
        <Grid rows="auto" columns={['1/2', '1/2']} gap="small" fill>
          <Heading level={3} gridArea="1 / 1 / 2 / 3" margin="small">
            New Sample
          </Heading>
          <FormFieldLabel
            label="Name"
            name="name"
            required
            placeholder="Sample Name"
            error={(formik.touched.name || submitted) && formik.errors.name}
            value={formik.values.name}
            onChange={formik.handleChange}
          />
          <FormFieldLabel
            label="Number of monomers (N)"
            name="N"
            type="number"
            required
            error={(formik.touched.N || submitted) && formik.errors.N}
            value={formik.values.N || ''}
            onChange={formik.handleChange}
          />
          <FormFieldLabel
            label="Time to stop simulation (tstop)"
            name="tstop"
            type="number"
            required
            error={(formik.touched.tstop || submitted) && formik.errors.tstop}
            value={formik.values.tstop || ''}
            onChange={formik.handleChange}
          />
          <FormFieldLabel
            label="Runs"
            name="runs"
            type="number"
            required
            error={(formik.touched.runs || submitted) && formik.errors.runs}
            value={formik.values.runs || ''}
            onChange={formik.handleChange}
          />
          <FormFieldLabel
            label="System volume (V)"
            name="V"
            type="number"
            help="Defaults to 1"
            error={(formik.touched.V || submitted) && formik.errors.V}
            value={formik.values.V || ''}
            onChange={formik.handleChange}
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
          {formik.values.model === 'Smoluchowski' ? (
            <SmoluchowskiFields formik={formik as SmoluchowsiFormik} />
          ) : null}
          {formik.values.model === 'BD-nucleation' ? (
            <BDNucleationFields formik={formik as BDNucleationFormik} />
          ) : null}
          <Box direction="row" gap="medium" gridArea="auto / 1 / auto / 3">
            <Button
              label={'Submit'}
              primary
              gap="small"
              type="submit"
              disabled={!formik.isValid && formik.submitCount > 0}></Button>
            <Button label={'Cancel'} onClick={onCancel} gap="small"></Button>
          </Box>
        </Grid>
      </Form>
    </Box>
  );
}

export default SampleForm;
