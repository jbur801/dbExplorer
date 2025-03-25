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

const getField = (fieldName: string, formPropBundle: formPropBundle) => {
  const { formData, fieldPath } = { ...formPropBundle };
  if (fieldPath.length === 0) {
    return formData[fieldName]
  }
  const val = fieldPath.reduce((acc: any, curr: any) => {
    return acc[curr];
  }, formData);
  console.log('name', fieldName, 'path', fieldPath, 'val', val, 'data', formData);
  //TODO this logic is NOT correct for composite fields, it might work, but its not correct
  return val && val[fieldName];
}
/**
 * Recursively updates nested state immutably
 */
const deepUpdate = (obj: any, path: (string | number)[], value: any): any => {
  if (path.length === 0) return value;

  const [key, ...rest] = path;

  if (Array.isArray(obj)) {
    const newArr = [...obj];
    newArr[key as number] = deepUpdate(obj[key as number], rest, value);
    return newArr;
  } else {
    return {
      ...obj,
      [key]: deepUpdate(obj?.[key], rest, value),
    };
  }
};
const changeField = (fieldName: string, bundle: formPropBundle, val: any) => {
  const { setFormData, fieldPath } = { ...bundle };

  console.log(fieldName, val, 'changed');
  setFormData((prev) => deepUpdate(prev, [...fieldPath, fieldName], val));
}

export type FormData = { [k: string]: any }

export type formPropBundle = {
  formData: FormData,
  setFormData: (fn: (prev: FormData) => FormData) => void,
  fieldPath: (string | number)[]
}

export type finalBundle = formPropBundle & {
  wrapper: (field: Field, contents: ReactNode) => ReactNode;
}

const renderStringContents = (field: ValidField<'string'>, bundle: finalBundle) => {
  const { wrapper, } = { ...bundle };
  return wrapper(field,
    <input
      className='w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'

      type="text"
      id={field.name}
      name={field.name}
      value={getField(field.name, bundle)}
      onChange={(e) => changeField(field.name, bundle, e.target.value)}
      required={field.required}

    />
  )
}

const renderNumberContents = (field: ValidField<'number'>, bundle: finalBundle) => {
  const { wrapper, } = { ...bundle };
  return wrapper(field,
    <input
      type="number"
      name={field.name}
      value={getField(field.name, bundle)}
      onChange={(e) => changeField(field.name, bundle, e.target.value)}
      required={field.required}
      className='w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-grey-700'
    />
  )
}

const renderBoolContents = (field: ValidField<'boolean'>, bundle: finalBundle) => {
  const { wrapper, } = { ...bundle };
  return wrapper(field,
    <input
      type="checkbox"
      name={field.name}
      value={getField(field.name, bundle)}
      onChange={(e) => changeField(field.name, bundle, e.target.checked)}
      required={field.required}
    />
  )
}
const renderEnumContents = (field: ValidField<'enum'>, bundle: finalBundle) => {
  const { formData, wrapper } = { ...bundle };
  const currentValue = getField(field.name, bundle)// Get the value once
  return wrapper(field,
    <select name='field.name' id={field.name}
      value={currentValue || ''} // Make it controlled by formData
      onChange={(e) => changeField(field.name, bundle, e.target.value)} // Call handleChange on selection change
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
      {children.map((child, i) => {
        const newPath = [...bundle.fieldPath, field.name, i];

        const childBundle = { ...bundle, fieldPath: newPath }
        return <RenderField key={newPath.reduce((acc, curr) => acc + '.' + curr, '')} field={child} bundle={childBundle} />
      })}
    </>
  )
}

const RenderTemplatedListContents = (props: thingyProps) => {

  const { field, bundle } = { ...props } as { field: ValidField<'templatedList'>, bundle: finalBundle }

  const [children, setChildren] = useState<Field[]>([]);

  const addField = () => {
    console.log('button clicked');
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
      {children.map((child, i) => {
        const newPath = [...bundle.fieldPath, field.name, i];
        const childBundle = { ...bundle, fieldPath: newPath }
        return <RenderField key={newPath.reduce((acc, curr) => acc + '.' + curr, '')} field={child} bundle={childBundle} />
      })}
    </>)
}
const RenderNestedContents = (props: thingyProps) => {
  const { field, bundle } = { ...props } as { field: ValidField<'composite'>, bundle: finalBundle }

  return (
    <>
      {field.children.map((childField) => {
        const newPath = [...bundle.fieldPath, field.name];
        const childBundle = { ...bundle, fieldPath: newPath }

        return (<RenderField field={childField} bundle={childBundle} />)
      })}

    </>
  )
}


const RenderCompositeContents = (props: thingyProps) => {
  const { field, bundle } = { ...props } as { field: ValidField<'composite'>, bundle: finalBundle }

  return (
    <>
      {field.children.map((childField) => {
        return (<RenderField field={childField} bundle={bundle} />)
      })}

    </>
  )
}
const RenderConditionalNestedContents = (props: innerFieldProps) => {
  const { field, bundle } = { ...props } as { field: ValidField<'conditionalComposite'>, bundle: finalBundle }
  const [activeChildFields, setActiveChildFields] = useState<Field[]>([]);
  const clearChildDiffs = (newFields: Field[], oldFields: Field[]) => {
    const remainingFields = oldFields.filter(field => newFields.some(newField => field.name === newField.name && newField.type === field.type));
    const currentValue = getField(field.name, bundle);
    const newKeys = Object.keys(currentValue).filter(key => remainingFields.some(field => field.name === key))
    const newValue: any = {};
    newKeys.forEach((key) => {
      if (key in currentValue) {
        newValue[key] = currentValue[key];
      }
    });
    changeField(field.name, bundle, newValue)
  }

  const curriedChangeHandler = (e: any) => {
    console.log('changing composite field selection', e.target.value, field.name);
    const newFields = field.options.find(opt => opt.value === e.target.value)?.children || [];
    clearChildDiffs(newFields, activeChildFields);

    console.log('target was', e.target.value);
    setActiveChildFields(newFields);
  }

  return (
    <>
      <select name='field.name' id={field.name}
        value={getField(field.name, bundle) || ''} // Make it controlled by formData
        onChange={curriedChangeHandler} // Call handleChange on selection change
      >
        <option value=''> Please Select</option>
        {field.options.map((opt) => {
          return <option value={opt.value}>{opt.label}</option>
        })}
      </select>
      {activeChildFields.map((childField) => {
        const newPath = [...bundle.fieldPath, field.name];
        const childBundle = { ...bundle, fieldPath: newPath }
        return <RenderField field={childField} bundle={childBundle} />
      })}
    </>
  )
}

const RenderConditionalCompositeContents = (props: innerFieldProps) => {
  const { field, bundle } = { ...props } as { field: ValidField<'conditionalComposite'>, bundle: finalBundle }
  const [activeChildFields, setActiveChildFields] = useState<Field[]>([]);
  const clearChildDiffs = (newFields: Field[], oldFields: Field[]) => {
    const goneFields = oldFields.filter(field => !newFields.some(newField => field.name === newField.name && newField.type === field.type));
    //TODO this doesn't work correctly for nested objects. 
    goneFields.forEach(field => changeField(field.name, bundle, undefined));
  }

  const curriedChangeHandler = (e: any) => {
    console.log('changing composite field selection', e.target.value, field.name);
    changeField(field.name, bundle, e.target.value);
    const newFields = field.options.find(opt => opt.value === e.target.value)?.children || [];
    clearChildDiffs(newFields, activeChildFields);

    console.log('target was', e.target.value);
    setActiveChildFields(newFields);
  }

  return (
    <>
      <select name='field.name' id={field.name}
        value={getField(field.name, bundle) || ''} // Make it controlled by formData
        onChange={curriedChangeHandler} // Call handleChange on selection change
      >
        <option value=''> Please Select</option>
        {field.options.map((opt) => {
          return <option value={opt.value}>{opt.label}</option>
        })}
      </select>
      {activeChildFields.map((childField) => {
        return <RenderField field={childField} bundle={bundle} />
      })}
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
  const [initialised, setInitialised] = useState<boolean>(false);
  const finalBundle = { ...bundle, wrapper: getDefaultFieldSkeleton };
  //potentially should limit how frequently this is triggered
  useEffect(() => {
    setInitialised(!(getField(field.name, bundle) === undefined));
  }, [bundle.formData]);

  useEffect(() => {
    if (!initialised) {
      console.log('initialising field...', field.name, field, bundle.formData);
      changeField(field.name, bundle, field.default || defaultDefaults[field.type]);
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
      case 'templatedList':
        return <RenderTemplatedListContents field={field} bundle={bundle} />
      case 'nested':
        return <RenderNestedContents field={field} bundle={bundle} />
      case 'conditionalNested':
        return <RenderConditionalNestedContents field={field} bundle={bundle} />
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
