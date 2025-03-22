
import { ReactNode, useEffect, useMemo, useState } from "react";
import { createListField, createTemplatedListField, defaultDefaults, Field, ValidField } from "./FieldTypes";



const getDefaultFieldSkeleton = (field: Field, innerFieldContents: React.ReactNode): React.ReactNode => {

  return (<><label htmlFor={field.name} className={'block text-sm font-medium text-gray-701'}>
    {field.label || field.name}
  </label>
    <div className='mt-2'>
      {innerFieldContents}
    </div>
  </>)
}


//curries propBundle such that child fields exist as a list element on parent fields. 
const curryPropBundleForList = (field: Field, bundle: formPropBundle, i: number): formPropBundle => {
  const newBundle: formPropBundle = {} as formPropBundle;
  const { formData, handleChange, fieldAccessor } = bundle;
  // const subFormData = formData[selectedValue];
  newBundle.formData = formData;
  newBundle.handleChange = (fieldName: string, value: any) => {
    const index = i;
    const currentValue = fieldAccessor(field.name)[index];
    const newValue = { ...currentValue, [fieldName]: value };
    const newList = [...fieldAccessor(field.name)];
    console.log('all data:', index, currentValue, value, newList)
    newList[index] = newValue;
    handleChange(field.name, newList);
  }
  newBundle.fieldAccessor = (name: string) => {
    //TODO something fucky is going on here, but I'm not smart enough to figure out what...
    const index = i;
    const element = fieldAccessor(field.name)[index];

    return element ? element[name] : undefined;
  }
  return newBundle;
}

//curries propBundle such that child fields exist as a property on parent fields.
const curryPropBundleForComposite = (field: Field, bundle: formPropBundle): formPropBundle => {
  const newBundle: formPropBundle = {} as formPropBundle;
  const { formData, handleChange, fieldAccessor } = bundle;
  newBundle.formData = formData;
  newBundle.handleChange = (fieldName: string, value: any) => {
    handleChange(field.name, { ...fieldAccessor(field.name), [fieldName]: value });
  }
  newBundle.fieldAccessor = buildFieldAccessor(fieldAccessor, field.name);
  return newBundle;
}

const buildFieldAccessor = (fieldAccessor: (name: string) => any, parentName?: string) => {
  return (name: string) => parentName ? fieldAccessor(parentName)[name] : fieldAccessor(name);
}

export const buildBaseFieldAccessor = (formData: { [k: string]: any }) => {
  return (name: string) => formData[name]
}

export type formPropBundle = {
  formData: { [k: string]: any },
  handleChange: (name: string, value: any) => void,
  fieldAccessor: (name: string) => any
}

export type finalBundle = formPropBundle & {
  wrapper: (field: Field, contents: ReactNode) => ReactNode;
}
const renderStringContents = (field: ValidField<'string'>, bundle: finalBundle) => {
  const { wrapper, handleChange, fieldAccessor } = { ...bundle };
  return wrapper(field,
    <input
      className='w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'

      type="text"
      id={field.name}
      name={field.name}
      value={fieldAccessor(field.name)}
      onChange={(e) => handleChange(field.name, e.target.value)}
      required={field.required}

    />
  )
}

const renderNumberContents = (field: ValidField<'number'>, bundle: finalBundle) => {
  const { wrapper, handleChange, fieldAccessor } = { ...bundle };
  return wrapper(field,
    <input
      type="number"
      name={field.name}
      value={fieldAccessor(field.name)}
      onChange={(e) => handleChange(field.name, e.target.value)}
      required={field.required}
      className='w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-grey-700'
    />
  )
}

const renderBoolContents = (field: ValidField<'boolean'>, bundle: finalBundle) => {
  const { wrapper, fieldAccessor, handleChange } = { ...bundle };
  return wrapper(field,
    <input
      type="checkbox"
      name={field.name}
      value={fieldAccessor(field.name)}
      onChange={(e) => handleChange(field.name, e.target.value)}
      required={field.required}
    />
  )
}
const renderEnumContents = (field: ValidField<'enum'>, bundle: finalBundle) => {
  const { formData, wrapper, fieldAccessor, handleChange } = { ...bundle };
  const currentValue = fieldAccessor(field.name)// Get the value once
  return wrapper(field,
    <select name='field.name' id={field.name}
      value={currentValue || ''} // Make it controlled by formData
      onChange={(e) => handleChange(field.name, e.target.value)} // Call handleChange on selection change
    >
      <option value=''> Please Select</option>
      {field.options.map((opt) => {
        return <option key={opt.value} value={opt.value}>{opt.label}</option>
      })}
    </select>
  )
}

function RenderListContents(props: thingyProps) {
  const { field, bundle } = { ...props } as { field: ValidField<'list'>, bundle: finalBundle }

  const [children, setChildren] = useState<Field[]>([]);
  // useEffect(() => {
  //   bundle.handleChange(field.name, [])
  //   // console.log(curryPropBundleForList(field, bundle, 0));
  // }, [])

  const addField = () => {
    console.log('button clicked');
    console.log(bundle.fieldAccessor(field.name));
    // bundle.handleChange(field.name, [...bundle.formData[field.name], {}]);
    setChildren(prev => {
      const newList = [...prev, createListField(children.length, field.legalFieldTypes)];
      console.log(newList);
      return newList;
    })
  }

  return bundle.wrapper(field,
    <>
      <button type="button" onClick={addField}>+</button>
      {children.map((child, i) => { return <RenderField field={child} bundle={curryPropBundleForList(field, bundle, i)} /> })}
    </>
  )
}

const RenderTemplatedListContents = (props: thingyProps) => {

  const { field, bundle } = { ...props } as { field: ValidField<'templatedList'>, bundle: finalBundle }

  const [children, setChildren] = useState<Field[]>([]);

  const addField = () => {
    console.log('button clicked');
    console.log(bundle.fieldAccessor(field.name));
    // bundle.handleChange(field.name, [...bundle.formData[field.name], {}]);
    setChildren(prev => {
      const newList = [...prev, createTemplatedListField(children.length, field.itemTemplates)];
      console.log(newList);
      return newList;
    })
  }


  return (
    <>
      <button type="button" onClick={addField}>+</button>
      {children.map((child, i) => { return <RenderField field={child} bundle={curryPropBundleForList(field, bundle, i)} /> })}
    </>)
}

const RenderCompositeContents = (props: thingyProps) => {
  const { field, bundle } = { ...props } as { field: ValidField<'composite'>, bundle: finalBundle }
  // useEffect(() => {
  //   field.compositeObject && bundle.handleChange(field.name, {})
  //   // console.log(curryPropBundleForList(field, bundle, 0));
  // }, [])

  return (
    <>
      {field.children.map((childField) =>
        <RenderField field={childField} bundle={field.compositeObject ? curryPropBundleForComposite(field, bundle) : bundle} />)}
    </>
  )
}

const RenderConditionalCompositeContents = (props: innerFieldProps) => {
  const { field, bundle } = { ...props } as { field: ValidField<'conditionalComposite'>, bundle: finalBundle }
  const { fieldAccessor, formData, handleChange } = { ...bundle };
  const [activeChildFields, setActiveChildFields] = useState<Field[]>([]);
  const clearChildDiffs = (newFields: Field[], oldFields: Field[]) => {
    if (field.compositeObject) {
      const goneFields = oldFields.filter(field => !newFields.some(newField => field.name === newField.name && newField.type === field.type));
      //TODO this doesn't work correctly for nested objects. 
      goneFields.forEach(field => handleChange(field.name, undefined));
    } else {
      const remainingFields = oldFields.filter(field => newFields.some(newField => field.name === newField.name && newField.type === field.type));
      const currentValue = fieldAccessor(field.name);
      const newKeys = Object.keys(currentValue).filter(key => remainingFields.some(field => field.name === key))
      const newValue: any = {};

      newKeys.forEach((key) => {
        if (key in currentValue) {
          newValue[key] = currentValue[key];
        }
      });
      handleChange(field.name, newValue)
    }
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
        value={fieldAccessor(field.name) || ''} // Make it controlled by formData
        onChange={curriedChangeHandler} // Call handleChange on selection change
      >
        <option value=''> Please Select</option>
        {field.options.map((opt) => {
          return <option value={opt.value}>{opt.label}</option>
        })}
      </select>
      {activeChildFields.map((childField) =>
        <RenderField field={childField} bundle={field.compositeObject ? curryPropBundleForComposite(childField, bundle) : bundle} />)}


    </>
  )
}
export type thingyProps = {
  field: Field,
  bundle: formPropBundle,
}
export type innerFieldProps = {
  field: Field,
  bundle: finalBundle
}
export const RenderField = (props: thingyProps) => {
  const { field, bundle } = { ...props };
  const [initialised, setInitialised] = useState<boolean>(true);
  const finalBundle = { ...bundle, wrapper: getDefaultFieldSkeleton };
  //potentially should limit how frequently this is triggered
  useEffect(() => {
    setInitialised(!(bundle.fieldAccessor(field.name) === undefined));
  }, [bundle.formData]);

  useEffect(() => {
    if (!initialised) {
      console.log('initialising field...', field.name, field, bundle.formData);
      bundle.handleChange(field.name, field.default || defaultDefaults[field.type]);
    }
  }, [initialised]);

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
        return <RenderCompositeContents field={field} bundle={bundle} />
      case 'conditionalComposite':
        return <RenderConditionalCompositeContents field={field} bundle={bundle} />
      case 'list':
        return <RenderListContents field={field} bundle={bundle} />//renderListContents(field, bundle);
      default:
        return null;
    }

  }
  return (

    <div className={'border-2 border-black'}>
      {initialised ?
        <>{getInnerFieldContents(field, finalBundle)}</> :
        <div>
          field not initialised {field.name}
        </div>

      }
    </div>

  )


}
