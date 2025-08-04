interface BooleanFieldProps {
  name: string;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  required?: boolean;
}

export default function BooleanField({
  name,
  label,
  value,
  onChange,
  error,
  required
}: BooleanFieldProps) {
  return (
    <div className="form-field">
      <div className="checkbox-field">
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={value || false}
          onChange={(e) => onChange(e.target.checked)}
          className="field-checkbox"
        />
        <label htmlFor={name} className="checkbox-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      </div>
      {error && <span className="field-error-message">{error}</span>}
    </div>
  );
}
