import React, {useEffect, useState, useContext} from 'react';
import {registerErrorMessagesData} from '../../../assets/authData';
import {SERVER_URL, REGISTER_ENDPOINT} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {UserContext} from '../../../../mobileclient/Context';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {AppParamList} from '../../../types/app.param.list';
import {useFcmToken} from '../../../../mobileclient/useFcmToken';

const useRegister = () => {
  const navigation = useNavigation<NavigationProp<AppParamList>>();
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [hidePassword, setHidePassword] = useState<boolean>(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState<boolean>(true);
  const [incorrectFields, setIncorrectFields] = useState<boolean[]>(
    Array(4).fill(false),
  );
  const [errorMessages, setErrorMessages] = useState<string[]>(
    Array(4).fill(''),
  );
  const [error, setError] = useState('');
  const {setAuthenticatedUser} = useContext(UserContext);
  const {fcmToken} = useFcmToken();
  const registerData = [
    {
      name: 'Username',
      placeholder: 'Username',
      setter: setUsername,
      getter: username,
      secureTextEntry: false,
    },
    {
      name: 'Email',
      placeholder: 'Email',
      setter: setEmail,
      getter: email,
      secureTextEntry: false,
    },
    {
      name: 'Password',
      placeholder: 'Password',
      setter: setPassword,
      getter: password,
      secureTextEntryGetter: hidePassword,
      secureTextEntrySetter: setHidePassword,
    },
    {
      name: 'Confirm Password',
      placeholder: 'Re-enter your password',
      setter: setConfirmPassword,
      getter: confirmPassword,
      secureTextEntryGetter: hideConfirmPassword,
      secureTextEntrySetter: setHideConfirmPassword,
    },
  ];

  useFocusEffect(
    React.useCallback(() => {
      wipeRegisterData();
    }, []),
  );

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleTogglePasswordVisibility = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    state: boolean,
  ) => setter(!state);

  const isValidUsername = () => username.length <= 20 && username.length >= 4;

  const isValidEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
  };

  const isValidPassword = () => password.length >= 8 && password.length <= 128;

  const isValidConfirmPassword = () => password === confirmPassword;

  const validationsMap: Map<number, () => boolean> = new Map([
    [0, isValidUsername],
    [1, isValidEmail],
    [2, isValidPassword],
    [3, isValidConfirmPassword],
  ]);

  const handleFieldChange = async (idx: number) => {
    setIncorrectFields(prev => {
      const updatedIncorrectFields = [...prev];
      const updateErrorMessages = [...errorMessages];

      const validateField = (index: number) => {
        const validationFn = validationsMap.get(index);
        const isValid = validationFn ? validationFn() : false;
        updatedIncorrectFields[index] = !isValid;
        updateErrorMessages[index] = !isValid
          ? registerErrorMessagesData[index]
          : '';
      };

      validateField(idx);

      if (idx === 2) {
        validateField(2);
        validateField(3);
      }

      setIncorrectFields(updatedIncorrectFields);
      setErrorMessages(updateErrorMessages);

      return updatedIncorrectFields;
    });
  };

  const handleRegister = async () => {
    for (let i: number = 0; i < incorrectFields.length; i++) {
      if (incorrectFields[i] || username.length === 0) {
        setError('Please fill out all the necessary fields');
        return;
      }
    }
    const registerUrl: string = `${SERVER_URL}${REGISTER_ENDPOINT}`;

    const response = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username, email, password, fcmToken}),
    });

    const result = await response.json();
    if (
      result.message === registerErrorMessagesData[4] ||
      result.message === registerErrorMessagesData[5]
    ) {
      wipeRegisterData();

      if (result.message === registerErrorMessagesData[4]) {
        setIncorrectFields([true, false, false, false]);
        setErrorMessages([registerErrorMessagesData[4], '', '', '']);
      } else if (result.message === registerErrorMessagesData[5]) {
        setIncorrectFields([false, true, false, false]);
        setErrorMessages(['', registerErrorMessagesData[5], '', '']);
      }
      return;
    }
    if (result.auth_token) {
      await AsyncStorage.setItem('auth_token', result.auth_token);
      setAuthenticatedUser({
        _id: result.userId,
        username,
        email,
        password,
        friends: [],
        receivedFriendRequests: [],
        sentFriendRequests: [],
        devices: [result.userId],
      });
      navigation.navigate('Home');
    }
  };

  const wipeRegisterData = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrorMessages(['', '', '', '']);
    setIncorrectFields([false, false, false, false]);
    setHidePassword(true);
    setHideConfirmPassword(true);
  };

  const handleCloseErrorModal = () => setError('');

  const handleNavigateSignIn = () => navigation.navigate('Login');

  return {
    registerData,
    incorrectFields,
    errorMessages,
    error,
    handleTogglePasswordVisibility,
    handleFieldChange,
    handleRegister,
    handleCloseErrorModal,
    handleNavigateSignIn,
  };
};

export {useRegister};
