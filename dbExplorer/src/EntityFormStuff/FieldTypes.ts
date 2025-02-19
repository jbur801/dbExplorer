export type FieldType = 'string' | 'number' | 'geolocation' | 'boolean'|'longString'|'enum'; // add more as needed

// Base structure of a field
export interface BaseField<T extends FieldType> {
  name: string;
  label: string;
  type: T;
  default?: FieldDefault<T>;
  required?:boolean;
  //validation is not guaranteed safe, it is your job to ensure your validation function is safe. 
  //If it errors, it will be ignored and all values will be considered valid.
  validation?: (val:any)=>boolean;
}

// Create a generic type that dynamically extends the BaseField based on the FieldType
export type Field<T extends FieldType = FieldType> = 
  T extends 'enum' ? BaseField<T> & { options: opt[] } : 
  BaseField<T>;

export type opt = {
  label:string,
  value:any
}

// Create a utility type that maps FieldType values to corresponding BaseField types
export type ValidFieldType = {
  [K in FieldType]: Field<K>;
}[FieldType];

export const makeOptsFromStrings = (vals:string[]):opt[]=>{
  return vals.map((val)=>{
    return {label:camelToLabel(val),value:val}
  })
}

export type FieldDefault<T extends FieldType> = T extends 'string'|'longString'|'enum'
? string
: T extends 'number'
? number
: T extends 'geolocation'
? {lat:number,long:number}
: T extends 'boolean'
? boolean
: never;


// Validation rules specific to each type
 export type FieldValidation<T extends FieldType> = T extends 'string'|'longString'
  ? StringFieldValidation|undefined
  : T extends 'number'
  ? NumberFieldValidation|undefined
  : T extends 'geolocation'
  ? GeoLocationFieldValidation|undefined
  : T extends 'boolean'
  ? BooleanFieldValidation|undefined
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


const camelToLabel = (camel:string)=>{
  const result = camel.replace(/([A-Z])/g, " $1");
  return(result.charAt(0).toUpperCase() + result.slice(1));
}