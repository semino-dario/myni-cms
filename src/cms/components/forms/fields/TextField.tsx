interface TextFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: 'text' | 'email' | 'url';
}

export default function TextField({
  name,
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  type = 'text'
}: TextFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={name} className="field-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`field-input ${error ? 'field-error' : ''}`}
      />
      {error && <span className="field-error-message">{error}</span>}
    </div>
  );
}
