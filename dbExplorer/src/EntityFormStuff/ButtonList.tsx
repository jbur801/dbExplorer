import { Field } from './FieldTypes'

export type ynm = 'yes' | 'no' | 'maybe'
export type ButtonSpec = {
  fields: Field[],
  auto: ynm,
  label: string,
  onSubmit: (data: { [key: string]: any }) => void,
}

export type ListProps = {
  specs: ButtonSpec[]
}



// Your dynamic fields would still follow a controlled component pattern
export const ButtonList = (props: ListProps) => {
  const { specs } = { ...props };

  return (
    <div className='bg-white py-8 px-6 shadow rounded-lg sm:px-10'>
      {
        specs.map((button) => <button type="submit">{button.label}</button>)
      }
    </div>
  );
};
