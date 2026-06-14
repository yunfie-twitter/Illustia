import { useEffect, useRef } from "react";
import { TextInput as RNTextInput } from "react-native";
import { Host, TextField, type TextFieldRef } from "@expo/ui/swift-ui";
import type { NativeTextInputProps } from "./NativeTextInput.types";

function mapKeyboardType(keyboardType: NativeTextInputProps["keyboardType"]) {
  if (keyboardType === "number-pad") return "numeric";
  if (keyboardType === "web-search") return "web-search";
  if (keyboardType === "email-address") return "email-address";
  if (keyboardType === "phone-pad") return "phone-pad";
  if (keyboardType === "decimal-pad") return "decimal-pad";
  if (keyboardType === "url") return "url";
  return "default";
}

export function NativeTextInput({ value, onChangeText, onSubmitEditing, style, ...props }: NativeTextInputProps) {
  const textFieldRef = useRef<TextFieldRef>(null);
  const nativeValueRef = useRef(typeof value === "string" ? value : "");

  useEffect(() => {
    if (typeof value !== "string" || value === nativeValueRef.current) return;
    nativeValueRef.current = value;
    void textFieldRef.current?.setText(value);
  }, [value]);

  if (onSubmitEditing) {
    return <RNTextInput value={value} onChangeText={onChangeText} onSubmitEditing={onSubmitEditing} style={style} {...props} />;
  }

  return (
    <Host matchContents style={style}>
      <TextField
        key="native-text-field"
        ref={textFieldRef}
        defaultValue={typeof value === "string" ? value : props.defaultValue}
        placeholder={props.placeholder}
        keyboardType={mapKeyboardType(props.keyboardType)}
        autocorrection={props.autoCorrect}
        multiline={props.multiline}
        numberOfLines={props.numberOfLines}
        onChangeText={(nextValue) => {
          nativeValueRef.current = nextValue;
          onChangeText?.(nextValue);
        }}
      />
    </Host>
  );
}
