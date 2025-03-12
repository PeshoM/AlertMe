import {
  SafeAreaView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import {styles} from '../../styles/auth.styles';
import React from 'react';
import {useRegister} from './hooks/useRegister';
import MaskedPasswordInput from '../../components/MaskedPasswordInput';

const RegisterScreen: React.FC = () => {
  const {
    registerData,
    incorrectFields,
    errorMessages,
    error,
    handleTogglePasswordVisibility,
    handleFieldChange,
    handleRegister,
    handleCloseErrorModal,
    handleNavigateSignIn,
  } = useRegister();

  return (
    <SafeAreaView style={styles.rootContainer}>
      <StatusBar backgroundColor="#f8fafc" barStyle="dark-content" />
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{flexGrow: 1}}
          showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <View style={styles.logoContainer}>
              <Image
                style={styles.logoImage}
                source={require('../../assets/images/logo.png')}
              />
              <Text style={styles.logoText}>AlertMe</Text>
            </View>

            <View style={styles.contentWrapper}>
              <Text style={styles.title}>Create Account</Text>

              <View style={styles.fieldsDataContainer}>
                {registerData.map((field, idx: number) => (
                  <View key={field.name} style={styles.fieldWrapper}>
                    <Text
                      style={[
                        styles.fieldLabels,
                        incorrectFields[idx] ? styles.invalidInput : null,
                      ]}>
                      {field.name}
                    </Text>

                    {field.name === 'Password' ||
                    field.name === 'Confirm Password' ? (
                      <MaskedPasswordInput
                        field={field}
                        idx={idx}
                        handleFieldChange={handleFieldChange}
                        incorrectFields={incorrectFields}
                      />
                    ) : (
                      <View
                        style={[
                          styles.inputContainer,
                          incorrectFields[idx] ? styles.invalidInput : null,
                        ]}>
                        <TextInput
                          style={styles.input}
                          placeholder={field.placeholder}
                          placeholderTextColor={
                            incorrectFields[idx] ? '#e53e3e' : '#a0aec0'
                          }
                          value={field.getter}
                          onChangeText={field.setter}
                          onBlur={() => handleFieldChange(idx)}
                          autoCapitalize="none"
                        />
                      </View>
                    )}

                    {incorrectFields[idx] && (
                      <Text style={styles.invalidText}>
                        {errorMessages[idx]}
                      </Text>
                    )}
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.signInButton}
                  onPress={handleRegister}>
                  <Text style={styles.signInButtonText}>Create Account</Text>
                </TouchableOpacity>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginTop: 24,
                    alignItems: 'center',
                  }}>
                  <Text style={styles.signUpText}>
                    Already have an account?
                  </Text>
                  <TouchableWithoutFeedback onPress={handleNavigateSignIn}>
                    <Text style={styles.signUpLink}>Sign In</Text>
                  </TouchableWithoutFeedback>
                </View>
              </View>
            </View>

            <Modal visible={!!error} transparent animationType="fade">
              <TouchableWithoutFeedback onPress={handleCloseErrorModal}>
                <View style={styles.modalContainer}>
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
