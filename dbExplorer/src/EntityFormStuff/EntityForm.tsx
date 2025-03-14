import React, { useState } from 'react';
import { BaseField, ValidField, FieldType, Field } from './FieldTypes'
import { FieldInput } from './FieldInput';


// Other field types (like nested objects) can be added similarl

// export type EntityStructure = {
//     entityFields:
// }

// export type EntityFormProps = {
//    idk:string 
// }

type FormProps = {
  fields: Field[],
  onSubmit: (data: { [key: string]: any }) => void
}


// Your dynamic fields would still follow a controlled component pattern
export const EntityForm = (props: FormProps) => {
  const { fields, onSubmit } = { ...props };
  const [formData, setFormData] = useState(() => {
    const initialValues: { [key: string]: any } = {};
    fields.forEach((field) => {
      initialValues[field.name] = field.default || ''; // Initialize default values
    });
    return initialValues;
  });

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className='bg-white py-8 px-6 shadow rounded-lg sm:px-10'>
      <form className={'mb-0 space-y-6'} onSubmit={handleSubmit}>
        {fields.map((field) => <FieldInput field={field} bundle={{ formData, handleChange }} />)}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
