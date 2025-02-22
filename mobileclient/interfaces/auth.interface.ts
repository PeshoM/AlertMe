export interface Field {
  name: string;
  placeholder: string;
  setter: React.Dispatch<React.SetStateAction<string>>;
  getter: string;
  secureTextEntry?: boolean;
  secureTextEntryGetter?: boolean;
  secureTextEntrySetter?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface MaskedPasswordInputProperties {
  field: Field;
  idx: number;
  handleFieldChange: (idx: number) => {};
  incorrectFields: boolean[];
}
