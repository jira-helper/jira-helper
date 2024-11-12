import React from 'react';

interface CheckboxLabelProps {
  label: string;
}

const Checkbox: React.FC<CheckboxLabelProps> = ({ label }) => {
  return (
    <label className="jh-label jh-gap-4 jh-cursor-pointer jh-justify-start">
      <input type="checkbox" className="jh-checkbox jh-checkbox-primary" />
      <span className="jh-text-primary-content jh-label-text jh-label-content jh-text-base">
        {label}
      </span>
    </label>
  );
};

export { Checkbox };
