import { ReactNode, useEffect, useState } from "react";
import { createListField, Field, ValidField } from "./FieldTypes";

//curries propBundle such that child fields exist as a list element on parent fields. 
const curryPropBundleForList = (field: Field, bundle: finalBundle, i: number): initBundle => {
  const newBundle: initBundle = {} as initBundle;
  const { formData, handleChange } = bundle;
  const subFormData = formData[field.name];
  // const subFormData = formData[selectedValue];
  newBundle.formData = subFormData[i];
  newBundle.handleChange = (fieldName: string, value: any) => {
    const index = parseInt(fieldName);
    const newList = [...subFormData];
    newList[index] = value;
    handleChange(field.name, newList);
  }
  return newBundle;
}

//curries propBundle such that child fields exist as a property on parent fields.
const curryPropBundleForComposite = (field: Field, bundle: finalBundle, children?: Field[]): initBundle => {
  const newBundle: initBundle = {} as initBundle;
  const { formData, handleChange } = bundle;
  const selectedValue = formData[field.name];
  const subFormData = formData[selectedValue];
  const initialValues: any = children && children.reduce((prev, child) => { return { ...prev, [child.name]: child.default } }, {});
  initialValues ?? handleChange(selectedValue, initialValues);
  newBundle.formData = subFormData;
  newBundle.handleChange = (fieldName: string, value: any) => {
    handleChange(field.name, { ...subFormData, [fieldName]: value });
  }
  return newBundle;
}

const getDefaultFieldSkeleton = (field: Field, innerFieldContents: React.ReactNode): React.ReactNode => {

  return (<><label htmlFor={field.name} className={'block text-sm font-medium text-gray-701'}>
    {field.label || field.name}
  </label>
    <div className='mt-2'>
      {innerFieldContents}
    </div>
  </>)
}

export type initBundle = {
  formData: { [k: string]: any },
  handleChange: (name: string, value: any) => void,
}
const renderStringContents = (field: ValidField<'string'>, bundle: finalBundle) => {
  const { formData, handleChange, getSkeleton } = { ...bundle };
  return getSkeleton(field,
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

const renderNumberContents = (field: ValidField<'number'>, bundle: finalBundle) => {
  const { formData, handleChange, getSkeleton } = { ...bundle };
  return getSkeleton(
    field,
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

const renderBoolContents = (field: ValidField<'boolean'>, bundle: finalBundle) => {
  const { formData, handleChange, getSkeleton } = { ...bundle };
  return getSkeleton(field,
    <input
      type="checkbox"
      name={field.name}
      value={formData[field.name]}
      onChange={(e) => handleChange(field.name, e.target.value)}
      required={field.required}
    />
  )
}
const renderEnumContents = (field: ValidField<'enum'>, bundle: finalBundle) => {
  const { formData, handleChange, getSkeleton } = { ...bundle };
  return getSkeleton(field,
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

function RenderListContents(props: thingyProps) {
  const { field, bundle } = { ...props } as { field: ValidField<'list'>, bundle: finalBundle }

  const [children, setChildren] = useState<Field[]>([]);
  useEffect(() => {
    bundle.handleChange(field.name, [])
    // console.log(curryPropBundleForList(field, bundle, 0));
  }, [])

  const addField = () => {
    console.log('button clicked');
    console.log(bundle.formData[field.name]);
    // bundle.handleChange(field.name, [...bundle.formData[field.name], {}]);
    setChildren(prev => {
      const newList = [...prev, createListField(children.length, field.legalFieldTypes)];
      console.log(newList);
      return newList;
    })
  }

  return (
    <>
      <button type="button" onClick={addField}>+</button>
      {children.map((child, i) => { return <FieldInput field={child} bundle={curryPropBundleForList(field, bundle, i)} /> })}
    </>
  )
}

const renderCompositeContents = (field: ValidField<'composite'>, bundle: finalBundle) => {
  const fieldCopy: ValidField<'composite'> = field;

  useEffect(() => {
    fieldCopy.compositeObject && bundle.handleChange(field.name, {})
    // console.log(curryPropBundleForList(field, bundle, 0));
  }, [])

  return (bundle.getSkeleton(field,
    <div id="collapsible" className="overflow-hidden transition-all duration-500 max-h-0">
      {field.children.map((field) =>
        <FieldInput field={field} bundle={fieldCopy.compositeObject ? curryPropBundleForComposite(fieldCopy, bundle, (field as ValidField<'composite'>).children) : bundle} />)}
    </div>)
  )
}

const renderConditionalCompositeContents = (field: ValidField<'conditionalComposite'>, bundle: finalBundle) => {
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
        value={bundle.fieldAccessor(field.name) || ''} // Make it controlled by formData
        onChange={curriedChangeHandler} // Call handleChange on selection change
      >
        <option value=''> Please Select</option>
        {field.options.map((opt) => {
          return <option value={opt.value}>{opt.label}</option>
        })}
      </select>
      {activeChildFields.map((field) =>
        <FieldInput field={field} bundle={fieldCopy.compositeObject ? curryPropBundleForComposite(field, bundle, (field as ValidField<'composite'>).children!) : bundle} />)}


    </>
  )
}

export type finalBundle = initBundle & { getSkeleton: (field: Field, innerContents: ReactNode) => ReactNode };
export type thingyProps = {
  field: Field,
  bundle: initBundle
}

export type FieldProps = {
  field: Field,
  bundle: finalBundle,
}

export const FieldInput = (props: thingyProps) => {
  const { field, bundle: mainBundle } = { ...props };

  const bundle = { ...mainBundle, getSkeleton: getDefaultFieldSkeleton }
  const [initialised, setInitialised] = useState<boolean>(true);
  useEffect(() => {
    console.log('field initialised', field.name, bundle.formData[field.name]);
    setInitialised(!!bundle.formData[field.name]);
  }, [bundle.formData]);


  const getInnerFieldContents = (field: Field, bundle: finalBundle) => {
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
      {initialised ?
        <>{getInnerFieldContents(field, bundle)}</>
        :
        <div>
          field not initialised {field.name}
        </div>

      }
    </div>

  )


}
