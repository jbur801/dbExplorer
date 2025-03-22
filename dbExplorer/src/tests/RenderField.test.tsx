
import { render, screen, fireEvent } from '@testing-library/react';
import { RenderField } from '../EntityFormStuff/RenderField';
import { Field } from '../EntityFormStuff/FieldTypes';

test('renders string input and updates value', () => {
  const field: Field = { type: 'string', name: 'testField', label: 'Test' };
  const formData: any = { testField: 'initial' };
  const mockHandleChange = jest.fn();
  const bundle = { formData, handleChange: mockHandleChange, fieldAccessor: (name: string): any => formData[name] };

  render(<RenderField field={field} bundle={bundle} />);
  const input = screen.getByLabelText('Test');

  fireEvent.change(input, { target: { value: 'newValue' } });
  expect(mockHandleChange).toHaveBeenCalledWith('testField', 'newValue');
});
