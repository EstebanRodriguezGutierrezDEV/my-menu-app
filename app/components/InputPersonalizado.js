import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { globalStyles } from "../styles/globalStyles";

export default function InputPersonalizado({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  autoCapitalize,
  keyboardType,
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        globalStyles.inputWrapper,
        isFocused && globalStyles.inputWrapperFocused,
      ]}
    >
      {icon && <Text style={globalStyles.inputIcon}>{icon}</Text>}
      <TextInput
        style={globalStyles.input}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.4)"
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />
    </View>
  );
}
