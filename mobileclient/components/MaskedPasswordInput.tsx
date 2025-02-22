import React, {useState} from 'react';
import {View, TextInput, TouchableOpacity, Image} from 'react-native';
import {styles} from '../styles/auth.styles';
import {MaskedPasswordInputProperties} from '../interfaces/auth.interface';

const MaskedPasswordInput = ({
  field,
  idx,
  handleFieldChange,
  incorrectFields,
}: MaskedPasswordInputProperties) => {
  const [isMasked, setIsMasked] = useState<boolean>(true);

  const handleTextChange = (text: string) => {
    if (text.length > field.getter.length)
      field.setter(() => field.getter + text[text.length - 1]);
    else field.setter(prev => prev.slice(0, -1));
  };

  const handleTogglePasswordVisibility = () => setIsMasked(prev => !prev);

  return (
    <View
      style={[
        styles.inputContainerPassword,
        incorrectFields[idx] && styles.invalidInput,
      ]}>
      <TextInput
        style={styles.inputPassword}
        placeholder={field.placeholder}
        placeholderTextColor={incorrectFields[idx] ? '#ff0000' : '#000'}
        value={isMasked ? '*'.repeat(field.getter.length) : field.getter}
        secureTextEntry={isMasked}
        onChangeText={handleTextChange}
        onBlur={() => handleFieldChange(idx)}
        autoCapitalize="none"
      />

      <TouchableOpacity
        activeOpacity={1}
        onPress={handleTogglePasswordVisibility}
        style={styles.iconContainer}>
        <Image
          source={
            isMasked
              ? require('../assets/images/hidePassword.png')
              : require('../assets/images/showPassword.png')
          }
          style={styles.icon}
        />
      </TouchableOpacity>
    </View>
  );
};

export default MaskedPasswordInput;
