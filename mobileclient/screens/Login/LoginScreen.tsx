import React from 'react';
import {
  SafeAreaView,
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {styles} from '../../styles/auth.styles';
import {useLogin} from './hooks/useLogin';
import MaskedPasswordInput from '../../components/MaskedPasswordInput';
import {Field} from '../../interfaces/auth.interface';

const LoginScreen: React.FC = () => {
  const {
    loginData,
    incorrectFields,
    errorMessages,
    error,
    handleTogglePasswordVisibility,
    handleFieldChange,
    handleLogin,
    handleCloseErrorModal,
    handleNavigateSignUp,
  } = useLogin();

  return (
    <SafeAreaView style={styles.rootContainer}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView>
          <View style={styles.container}>
            <View style={styles.logoContainer}>
              <Image
                style={styles.logoImage}
                source={require('../../assets/images/logo.png')}
              />

              <Text style={styles.logoText}>AlertMe</Text>
            </View>
            <View style={styles.contentWrapper}>
              <Text style={styles.title}>Sign In</Text>
              <View style={styles.fieldsDataContainer}>
                {loginData.map((field: Field, idx: number) => (
                  <View key={field.name}>
                    <View style={styles.fieldWrapper}>
                      <Text
                        style={[
                          styles.fieldLabels,
                          incorrectFields[idx] ? styles.invalidInput : null,
                        ]}>
                        {field.name}
                        {incorrectFields[idx] && (
                          <Text style={styles.invalidText}> *</Text>
                        )}
                      </Text>

                      {field.name === 'Password' ? (
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
                              incorrectFields[idx] ? '#ff0000' : '#000'
                            }
                            value={field.getter}
                            onChangeText={field.setter}
                            onBlur={() => handleFieldChange(idx)}
                            autoCapitalize="none"
                          />
                        </View>
                      )}
                    </View>

                    {incorrectFields[idx] && (
                      <Text style={styles.invalidText}>
                        {errorMessages[idx]}
                      </Text>
                    )}
                  </View>
                ))}

                <TouchableOpacity>
                  <Text style={styles.forgotPasswordText}>
                    Forgot password?
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.signInButton}
                  onPress={handleLogin}>
                  <Text style={styles.signInButtonText}>Sign In</Text>
                </TouchableOpacity>

                <Text style={styles.signUpText}>
                  Don't Have an Account?{' '}
                  <TouchableWithoutFeedback onPress={handleNavigateSignUp}>
                    <Text style={styles.signUpLink}>Sign Up</Text>
                  </TouchableWithoutFeedback>
                </Text>
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

export default LoginScreen;
