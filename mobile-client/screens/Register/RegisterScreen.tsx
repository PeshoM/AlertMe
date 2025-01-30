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
} from "react-native";
import { styles } from "../../styles/auth.styles";
import React from "react";
import { RegisterScreenProps } from "../../types/screen.props";
import { useRegister } from "./hooks/useRegister";

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
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
  } = useRegister({ navigation });
  return (
    <SafeAreaView style={styles.rootContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView>
          <View style={styles.container}>
            <View style={styles.logoContainer}>
              <Image
                style={styles.logoImage}
                source={require("../../assets/images/logo.png")}
              />
              <Text style={styles.logoText}>AlertMe</Text>
            </View>
            <View style={styles.contentWrapper}>
              <Text style={styles.title}>Sign Up</Text>
              <View style={styles.fieldsDataContainer}>
                {registerData.map((field, idx: number) => (
                  <View>
                    <View style={styles.fieldWrapper}>
                      <Text
                        style={[
                          styles.fieldLabels,
                          incorrectFields[idx] ? styles.invalidInput : null,
                        ]}
                      >
                        {field.name}
                        {incorrectFields[idx] && (
                          <Text style={styles.invalidText}> *</Text>
                        )}
                      </Text>
                      <View
                        style={[
                          styles.inputContainer,
                          incorrectFields[idx] ? styles.invalidInput : null,
                        ]}
                      >
                        <TextInput
                          style={styles.input}
                          placeholder={field.placeholder}
                          placeholderTextColor={
                            incorrectFields[idx] ? "#ff0000" : "#000"
                          }
                          value={field.getter}
                          onChangeText={field.setter}
                          onBlur={() => handleFieldChange(idx)}
                          autoCapitalize="none"
                          secureTextEntry={
                            field.secureTextEntryGetter || field.secureTextEntry
                          }
                        />
                        {field.secureTextEntryGetter !== undefined && (
                          <TouchableOpacity
                            activeOpacity={1}
                            onPress={() =>
                              handleTogglePasswordVisibility(
                                field.secureTextEntrySetter,
                                field.secureTextEntryGetter
                              )
                            }
                            style={styles.iconContainer}
                          >
                            <Image
                              source={
                                field.secureTextEntryGetter
                                  ? require("../../assets/images/hidePassword.png")
                                  : require("../../assets/images/showPassword.png")
                              }
                              style={styles.icon}
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    {incorrectFields[idx] && (
                      <Text style={styles.invalidText}>
                        {errorMessages[idx]}
                      </Text>
                    )}
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.signInButton}
                  onPress={handleRegister}
                >
                  <Text style={styles.signInButtonText}>Sign Up</Text>
                </TouchableOpacity>

                <Text style={styles.signUpText}>
                  Already have an Account?{" "}
                  <TouchableWithoutFeedback onPress={handleNavigateSignIn}>
                    <Text style={styles.signUpLink}>Sign In</Text>
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

export default RegisterScreen;
