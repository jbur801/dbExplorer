import { useEffect, useState } from "react";
import { createListField, Field, ValidField } from "./FieldTypes";

//curries propBundle such that child fields exist as a list element on parent fields. 
const curryPropBundleForList = (field: Field, bundle: formPropBundle, i: number): formPropBundle => {
  const newBundle: formPropBundle = {} as formPropBundle;
  const { formData, handleChange } = bundle;
  const subFormData = formData[field.name];
  // const subFormData = formData[selectedValue];
  newBundle.formData = subFormData[i];
  newBundle.handleChange = (fieldName: string, value: any) => {
    // const index = parseInt(fieldName);
    const newList = [...subFormData];
    newList[i] = value;
    handleChange(field.name, newList);
  }
  return newBundle;
}

//curries propBundle such that child fields exist as a property on parent fields.
const curryPropBundleForComposite = (field: Field, bundle: formPropBundle, children: Field[]): formPropBundle => {
  const newBundle: formPropBundle = {} as formPropBundle;
  const { formData, handleChange } = bundle;
  const selectedValue = formData[field.name];
  const subFormData = formData[selectedValue];
  const initialValues: any = children.reduce((prev, child) => { return { ...prev, [child.name]: child.default } }, {});
  handleChange(selectedValue, initialValues);
  newBundle.formData = subFormData;
  newBundle.handleChange = (fieldName: string, value: any) => {
    handleChange(field.name, { ...subFormData, [fieldName]: value });
  }
  return newBundle;
}


export type formPropBundle = {
  formData: { [k: string]: any },
  handleChange: (name: string, value: any) => void,
}
const renderStringContents = (field: ValidField<'string'>, bundle: formPropBundle) => {
  const { formData, handleChange } = { ...bundle };
  return (
    <input
      className='w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'

      type="text"
      id={field.name}
      name={field.name}
      value={formData[field.name]}
      onChange={(e) => handleChange(field.name, e.target.value)}
      required={field.required}

    />
  )
}

const renderNumberContents = (field: ValidField<'number'>, bundle: formPropBundle) => {
  const { formData, handleChange } = { ...bundle };
  return (
    <input
      type="number"
      name={field.name}
      value={formData[field.name]}
      onChange={(e) => handleChange(field.name, e.target.value)}
      required={field.required}
      className='w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-grey-700'
    />
  )
}

const renderBoolContents = (field: ValidField<'boolean'>, bundle: formPropBundle) => {
  const { formData, handleChange } = { ...bundle };
  return (
    <input
      type="checkbox"
      name={field.name}
      value={formData[field.name]}
      onChange={(e) => handleChange(field.name, e.target.value)}
      required={field.required}
    />
  )
}
const renderEnumContents = (field: ValidField<'enum'>, bundle: formPropBundle) => {
  const { formData, handleChange } = { ...bundle };
  return (
    <select name='field.name' id={field.name}
      value={formData[field.name] || ''} // Make it controlled by formData
      onChange={(e) => handleChange(field.name, e.target.value)} // Call handleChange on selection change
    >
      <option value=''> Please Select</option>
      {field.options.map((opt) => {
        return <option value={opt.value}>{opt.label}</option>
      })}
    </select>
  )
}

const RenderListContents = (props: thingyProps) => {
  const { field, bundle } = { ...props } as { field: ValidField<'list'>, bundle: formPropBundle }

  const [children, setChildren] = useState<Field[]>([]);
  useEffect(() => {
    bundle.handleChange(field.name, [])
    console.log(curryPropBundleForList(field, bundle, 0));
  }, [])
  const addField = () => {
    bundle.handleChange(field.name, [...bundle.formData[field.name], {}]);
    setChildren(prev => {
      return [...prev, createListField(children.length, field.legalFieldTypes)];
    })
  }

  // {children.map(child => <FieldInput field={child} bundle={curryPropBundleForList(field, bundle)} />)}
  return (
    <>
      <button type="button" onClick={addField}>+</button>
    </>
  )
}

const renderCompositeContents = (field: ValidField<'composite'>, bundle: formPropBundle) => {
  const fieldCopy: ValidField<'composite'> = field;
  return (
    <>
      {field.children.map((field) => <FieldInput field={field} bundle={fieldCopy.compositeObject ? curryPropBundleForComposite(field, bundle) : bundle} />)}
    </>
  )
}

const renderConditionalCompositeContents = (field: ValidField<'conditionalComposite'>, bundle: formPropBundle) => {
  const { formData, handleChange } = { ...bundle };
  const [activeChildFields, setActiveChildFields] = useState<Field[]>([]);
  const fieldCopy: ValidField<'conditionalComposite'> = field;
  const clearChildDiffs = (newFields: Field[], oldFields: Field[]) => {
    const goneFields = oldFields.filter(field => !newFields.some(newField => field.name === newField.name && newField.type === field.type));
    goneFields.forEach(field => formData[field.name] = undefined);
  }

  const curriedChangeHandler = (e: any) => {
    handleChange(field.name, e.target.value);
    const newFields = field.options.find(opt => opt.value === e.target.value)?.children || [];
    clearChildDiffs(newFields, activeChildFields);

    console.log('target was', e.target.value);
    setActiveChildFields(newFields);
  }

  return (
    <>
      <select name='field.name' id={field.name}
        value={formData[field.name] || ''} // Make it controlled by formData
        onChange={curriedChangeHandler} // Call handleChange on selection change
      >
        <option value=''> Please Select</option>
        {field.options.map((opt) => {
          return <option value={opt.value}>{opt.label}</option>
        })}
      </select>
      {activeChildFields.map((field) => <FieldInput field={field} bundle={fieldCopy.compositeObject ? curryPropBundleForComposite(field, bundle) : bundle} />)}


    </>
  )
}
export type thingyProps = {
  field: Field,
  bundle: formPropBundle,
}

export const FieldInput = (props: thingyProps) => {
  const { field, bundle } = { ...props };
  useEffect(() => {
    console.log('field initialised', field.name, bundle.formData);
  }, []);


  const getInnerFieldContents = (field: Field, bundle: formPropBundle) => {
    switch (field.type) {
      case 'string':
        return renderStringContents(field, bundle);
      case 'number':
        return renderNumberContents(field, bundle);
      case 'boolean':
        return renderBoolContents(field, bundle);
      case 'enum':
        return renderEnumContents(field, bundle);
      case 'composite':
        return renderCompositeContents(field, bundle);
      case 'conditionalComposite':
        return renderConditionalCompositeContents(field, bundle);
      case 'list':
        return <RenderListContents field={field} bundle={bundle} />//renderListContents(field, bundle);
      default:
        return null;
    }

  }
  return (

    <div className={'border-2px'}>
      <label htmlFor={field.name} className={'block text-sm font-medium text-gray-700'}>
        {field.label || field.name}
      </label>
      <div className='mt-1'>
        {getInnerFieldContents(field, bundle)}
      </div>
    </div>

  )


}
