interface NumberFieldProps {
  name: string;
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
}

export default function NumberField({
  name,
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  min,
  max
}: NumberFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
    onChange(numValue);
  };

  return (
    <div className="form-field">
      <label htmlFor={name} className="field-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type="number"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        max={max}
        className={`field-input ${error ? 'field-error' : ''}`}
      />
      {error && <span className="field-error-message">{error}</span>}
    </div>
  );
}
