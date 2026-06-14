export interface NativeSegmentedOption<T extends string> {
  label: string;
  value: T;
}

export interface NativeSegmentedControlProps<T extends string> {
  value: T;
  options: NativeSegmentedOption<T>[];
  onChange: (value: T) => void;
}
