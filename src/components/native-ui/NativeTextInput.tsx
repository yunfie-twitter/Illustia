import { TextInput } from "react-native";
import type { NativeTextInputProps } from "./NativeTextInput.types";

export function NativeTextInput(props: NativeTextInputProps) {
  return <TextInput {...props} />;
}
