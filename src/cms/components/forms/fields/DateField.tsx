interface DateFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  includeTime?: boolean;
}

export default function DateField({
  name,
  label,
  value,
  onChange,
  error,
  required,
  includeTime = false
}: DateFieldProps) {
  const inputType = includeTime ? 'datetime-local' : 'date';
  
  return (
    <div className="form-field">
      <label htmlFor={name} className="field-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`field-input ${error ? 'field-error' : ''}`}
      />
      {error && <span className="field-error-message">{error}</span>}
    </div>
  );
}
