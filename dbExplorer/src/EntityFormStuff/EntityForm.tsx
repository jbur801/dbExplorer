import React, { useState } from 'react';
import {BaseField, Field, FieldType, ValidFieldType} from './FieldTypes'


// Other field types (like nested objects) can be added similarl

// export type EntityStructure = {
//     entityFields:
// }

// export type EntityFormProps = {
//    idk:string 
// }

type FormProps = {
  fields:ValidFieldType[],
  onSubmit:(data:{[key: string]: any})=>void 
}



// Your dynamic fields would still follow a controlled component pattern
export const EntityForm = (props:FormProps) => {
  const {fields,onSubmit} = {...props};
  const [formData, setFormData] = useState(() => {
    const initialValues:{[key: string]: any} = {};
    fields.forEach((field) => {
      initialValues[field.name] = field.default || ''; // Initialize default values
    });
    return initialValues;
  });

  const handleChange = (name:string, value:any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e:any) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className='bg-white py-8 px-6 shadow rounded-lg sm:px-10'>
    <form className={'mb-0 space-y-6'} onSubmit={handleSubmit}>
      {fields.map((field) => {
        
        switch (field.type) {
          case 'string':
            return (
              <div key={field.name}>
                <label htmlFor={field.name} className='block text-sm font-medium text-gray-700' >{field.label}</label>
                <div className='mt-1'>
                <input
                  className='w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  
                  type="text"
                  id={field.name}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}

                />
              </div>
                                
              </div>
            );
          case 'number':
            return (
              <div key={field.name}>
                <label htmlFor={field.name} className='block text-sm font-medium text-gray-700' >{field.label}</label>
                <div className='mt-1'>
                <input
                  type="number"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
className='w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                />
                </div>
              </div>
            );
            case 'boolean':
              return (
                <div key={field.name}>
                  <label htmlFor={field.name} className='block text-sm font-medium text-gray-700' >{field.label}</label>
                  <div className='mt-1'>
                  <input
                    type="checkbox"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                  />
                  </div>
                </div>
              );
            case 'enum':
              return(
                <div>
                  <label htmlFor={field.name} className={'block text-sm font-medium text-gray-700'}>
                    {field.label}
                  </label>
                  <div className='mt-1'>
                      <select name='field.name' id={field.name}>
                        <option value=''> Please Select</option>
                       {field.options.map((opt)=>{
                        return <option value={opt.value}>{opt.label}</option> 
                       })}
                      </select>
                  </div>
                </div>
              ) 
          // Handle other field types...
          default:
            return null;
        }
      })}
      <button type="submit">Submit</button>
    </form>
    </div>
  );
};