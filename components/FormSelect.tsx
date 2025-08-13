// components/FormSelect.tsx
import React from 'react';
import classNames from 'classnames';

/**
 * @interface FormSelectProps
 * @description Props for the FormSelect component.
 */
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** The label text to display above the select input. */
  label: string;
  /** The unique ID for the select input, used for the `for` attribute of the label. */
  id: string;
  /** The children to render inside the select element, typically <option> elements. */
  children: React.ReactNode;
  /** Optional additional CSS classes to apply to the component's container. */
  className?: string;
}

/**
 * @component FormSelect
 * @description A reusable, styled select dropdown component for forms.
 * It provides consistent styling for select inputs across the application.
 */
const FormSelect: React.FC<FormSelectProps> = ({
  label,
  id,
  children,
  className,
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
      <select
        id={id}
        {...props}
        className={classNames(
          'block w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm h-11'
        )}
      >
        {children}
      </select>
    </div>
  );
};

export default FormSelect;
