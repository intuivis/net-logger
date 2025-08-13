// components/FormInput.tsx
import React from 'react';
import classNames from 'classnames';

/**
 * @interface FormInputProps
 * @description Props for the FormInput component.
 */
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** The label text to display above the input. */
  label: string;
  /** The unique ID for the input, used for the `for` attribute of the label. */
  id: string;
  /** Optional additional CSS classes to apply to the component's container. */
  className?: string;
  /** An optional label to display as a unit inside the input field (e.g., "MHz"). */
  unitLabel?: string;
  /** Whether the input is required. */
  required?: boolean;
}

/**
 * @component FormInput
 * @description A reusable, styled text input component for forms.
 * It provides consistent styling and can include a unit label.
 */
const FormInput: React.FC<FormInputProps> = ({
  label,
  id,
  className,
  unitLabel,
  required,
  ...props
}) => {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-dark-text-secondary mb-1"
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          {...props}
          className={classNames(
            'block w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm h-11',
            { 'pr-12': unitLabel }
          )}
        />
        {unitLabel && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
            {unitLabel}
          </span>
        )}
      </div>
    </div>
  );
};

export default FormInput;