interface TextAreaFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
}

export default function TextAreaField({
  name,
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  rows = 4
}: TextAreaFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={name} className="field-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`field-input field-textarea ${error ? 'field-error' : ''}`}
      />
      {error && <span className="field-error-message">{error}</span>}
    </div>
  );
}
