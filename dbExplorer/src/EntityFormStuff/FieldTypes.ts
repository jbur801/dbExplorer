export type FieldType = 'nested' | 'conditionalNested' | 'string' | 'number' | 'geolocation' | 'boolean' | 'longString' | 'enum' | 'composite' | 'conditionalComposite' | 'list' | 'templatedList'; // add more as needed
export const FieldTypes: string[] = ['nested', 'conditionalNested', 'string', 'number', 'geolocation', 'boolean', 'longString', 'enum', 'composite', 'conditionalComposite', 'list', 'templatedList']; // add more as needed 
// Base structure of a field
export interface BaseField<T extends FieldType> {
  name: string;
  label?: string;
  type: T;
  default?: FieldDefault<T>;
  required?: boolean;
  //validation is not guaranteed safe, it is your job to ensure your validation function is safe. 
  //If it errors, it will be ignored and all values will be considered valid.
  validation?: (val: any) => boolean;
}

// Create a generic type that dynamically extends the BaseField based on the FieldType
export type ValidField<T extends FieldType> =
  T extends 'enum' ? BaseField<T> & { options: opt[] } :
  T extends 'composite' | 'nested' ? BaseField<T> & compositeFieldAtts :
  T extends 'conditionalComposite' | 'nestedComposite' ? BaseField<T> & { options: conditionalOpt[] } :
  T extends 'list' ? BaseField<T> & { legalFieldTypes?: FieldType[] } :
  T extends 'templatedList' ? BaseField<T> & templatedListAtts :
  BaseField<T>;
//this exists to trick the ts compiler and its circular reference complaints
type compositeFieldAtts = { children: Field[] }
type templatedListAtts = { itemTemplates: Field[] };

export type FieldInstance<T extends FieldType> =
  ValidField<T> & { value?: FieldDefault<T> }

export type opt = {
  label: string,
  value: any
}

export type conditionalOpt = opt & { children: Field[] }

// Create a utility type that maps FieldType values to corresponding BaseField types
export type Field = {
  [K in FieldType]: ValidField<K>;
}[FieldType];


export const makeOptsFromStrings = (vals: string[]): opt[] => {
  return vals.map((val) => {
    return { label: camelToLabel(val), value: val }
  })
}

export const fieldChildrenMap: { [k: string]: Field[] } = {
  'enum': [{
    name: 'options', type: 'templatedList', required: true, itemTemplates:
      [{
        name: 'opt', type: 'composite', children: [
          { name: 'label', type: 'string', required: true },
          { name: 'value', type: 'string', required: true }
        ]
      }]
  }],
  'nested': [
    { name: 'children', type: 'list' }
  ],
  'conditionalNested': [
    {
      name: 'options', type: 'templatedList', itemTemplates:
        [{
          name: 'opt', type: 'composite', children: [
            { name: 'label', type: 'string', required: true },
            { name: 'value', type: 'string', required: true },
            { name: 'children', type: 'list' },
          ]
        }]
    }],

  'composite': [
    { name: 'children', type: 'list' }
  ],
  'conditionalComposite': [
    {
      name: 'options', type: 'templatedList', itemTemplates:
        [{
          name: 'opt', type: 'composite', children: [
            { name: 'label', type: 'string', required: true },
            { name: 'value', type: 'string', required: true },
            { name: 'children', type: 'list' },
          ]
        }]
    }],
  'list': [
    {
      name: 'legalFieldTypes', type: 'enum', options: FieldTypes.map(typeName => { return { label: typeName, value: typeName } })
    }
  ],
  'templatedList': [
    { name: 'itemTemplates', type: 'list' }
  ],
}

export const fieldField: Field[] = [
  { name: 'name', label: 'Name', type: 'string', validation: undefined, required: true },
  { name: 'label', label: 'Label', type: 'string', required: false },
  { name: 'required', label: 'required', type: 'boolean', default: false, validation: undefined, required: false },
  {
    name: 'type', label: 'Type', type: 'conditionalComposite', required: true,
    options: FieldTypes.map(typeName => { return { label: typeName, value: typeName, children: fieldChildrenMap[typeName] } })
  },
]

export const createListField = (index: number, allowedTypes?: FieldType[]): Field => {
  return { name: '' + index, type: 'nested', required: true, children: fieldField }
}

export const createTemplatedListField = (index: number, templates: Field[]): Field => {
  return {
    name: '' + index, type: 'conditionalComposite', required: true, options: templates.map(template => {
      return { label: template.name, value: template.name, children: [template] }
    })
  }
}



export type FieldDefault<T extends FieldType> = T extends 'string' | 'longString' | 'enum'
  ? string
  : T extends 'number'
  ? number
  : T extends 'geolocation'
  ? { lat: number, long: number }
  : T extends 'boolean'
  ? boolean
  : never;

export const defaultDefaults: { [key in FieldType]: any } = {
  'string': '',
  'longString': '',
  'enum': '',
  'boolean': false,
  'composite': '',
  'conditionalComposite': '',
  'nested': {},
  'conditionalNested': {},
  'list': [],
  'templatedList': [],
  'number': 0,
  'geolocation': { lat: 0, long: 0 },
}

// Validation rules specific to each type
export type FieldValidation<T extends FieldType> = T extends 'string' | 'longString'
  ? StringFieldValidation | undefined
  : T extends 'number'
  ? NumberFieldValidation | undefined
  : T extends 'geolocation'
  ? GeoLocationFieldValidation | undefined
  : T extends 'boolean'
  ? BooleanFieldValidation | undefined
  : never;

// Example validation rules for string fields
interface StringFieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string; // Regex pattern
}

// Example validation rules for number fields
interface NumberFieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
}

// Example validation rules for geolocation fields
interface GeoLocationFieldValidation {
  required?: boolean;
  latitudeRange?: [number, number]; // [min, max]
  longitudeRange?: [number, number]; // [min, max]
}

// Example validation rules for boolean fields
interface BooleanFieldValidation {
  required?: boolean;
}


const camelToLabel = (camel: string) => {
  const result = camel.replace(/([A-Z])/g, " $1");
  return (result.charAt(0).toUpperCase() + result.slice(1));
}
