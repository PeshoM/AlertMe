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
  StatusBar,
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
              <Text style={styles.title}>Welcome Back</Text>

              <View style={styles.fieldsDataContainer}>
                {loginData.map((field: Field, idx: number) => (
                  <View key={field.name} style={styles.fieldWrapper}>
                    <Text
                      style={[
                        styles.fieldLabels,
                        incorrectFields[idx] ? styles.invalidInput : null,
                      ]}>
                      {field.name}
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

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginTop: 24,
                    alignItems: 'center',
                  }}>
                  <Text style={styles.signUpText}>Don't have an account?</Text>
                  <TouchableWithoutFeedback onPress={handleNavigateSignUp}>
                    <Text style={styles.signUpLink}>Sign Up</Text>
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

export default LoginScreen;
