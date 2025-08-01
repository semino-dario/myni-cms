export interface BaseFieldProps {
  name: string;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

export interface TextFieldProps extends BaseFieldProps {
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
}

export interface MediaFieldProps extends BaseFieldProps {
  accept?: string[];
  multiple?: boolean;
  maxSize?: number;
}

export interface RelationFieldProps extends BaseFieldProps {
  target: string;
  multiple?: boolean;
  displayField?: string;
}

export interface SelectFieldProps extends BaseFieldProps {
  options: Array<{ value: string; label: string }>;
  multiple?: boolean;
}

export type FieldProps = 
  | TextFieldProps
  | MediaFieldProps 
  | RelationFieldProps
  | SelectFieldProps;
