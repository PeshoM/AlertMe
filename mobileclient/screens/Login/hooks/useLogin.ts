import React, {useEffect, useState, useContext} from 'react';
import {loginErrorMessagesData} from '../../../assets/authData';
import {GET_AUTHENTICATED_USER, LOGIN_ENDPOINT, SERVER_URL} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {UserContext} from '../../../Context';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {AppParamList} from '../../../types/app.param.list';
import {useFcmToken} from '../../../useFcmToken';
import {Field} from '../../../interfaces/auth.interface';

const useLogin = () => {
  const navigation = useNavigation<NavigationProp<AppParamList>>();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [hidePassword, setHidePassword] = useState<boolean>(true);
  const [incorrectFields, setIncorrectFields] = useState<boolean[]>(
    Array(2).fill(false),
  );
  const [errorMessages, setErrorMessages] = useState<string[]>(
    Array(2).fill(''),
  );
  const [error, setError] = useState('');
  const {setAuthenticatedUser, setCombinations, combinationsRef} =
    useContext(UserContext);
  const {fcmToken} = useFcmToken();

  const loginData: Field[] = [
    {
      name: 'Username',
      placeholder: 'Username',
      setter: setUsername,
      getter: username,
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
  ];

  useEffect(() => {
    getAuthenticatedUser();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      wipeLoginData();
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

  const isValidPassword = () => {
    return password.length >= 8 && password.length <= 128;
  };

  const validationsMap: Map<number, () => boolean> = new Map([
    [0, isValidUsername],
    [1, isValidPassword],
  ]);

  const handleFieldChange = async (idx: number) => {
    setIncorrectFields(prev => {
      prev = [...incorrectFields];
      const validateFunction: boolean = validationsMap.get(idx)!();

      validateFunction ? (prev[idx] = !validateFunction) : (prev[idx] = true);

      setErrorMessages(newErrorMessages => {
        newErrorMessages = [...errorMessages];
        newErrorMessages[idx] = prev[idx] ? loginErrorMessagesData[idx] : '';
        return newErrorMessages;
      });

      return prev;
    });
  };

  const handleLogin = async () => {
    for (let i: number = 0; i < incorrectFields.length; i++) {
      if (incorrectFields[i] || username.length === 0) {
        setError('Please fill out all the necessary fields');
        return;
      }
    }
    const loginUrl: string = `${SERVER_URL}${LOGIN_ENDPOINT}`;

    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username, password, fcmToken}),
    });

    const result = await response.json();

    if (!result.auth_token) {
      setUsername('');
      setPassword('');
      setErrorMessages(prev => {
        prev = [...errorMessages];
        prev[1] = loginErrorMessagesData[2];
        return prev;
      });
      setIncorrectFields([true, true]);
      return;
    }

    await AsyncStorage.setItem('auth_token', result.auth_token);

    getAuthenticatedUser();
    navigation.navigate('Home');
  };

  const getAuthenticatedUser = async () => {
    const storedToken: string | null = await AsyncStorage.getItem('auth_token');

    if (!storedToken) return;

    const getAuthUserUrl: string = `${SERVER_URL}${GET_AUTHENTICATED_USER}`;
    const response = await fetch(getAuthUserUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: storedToken,
      }),
    }).then(res => res.json());

    if (!response.authenticatedUser) return;

    setAuthenticatedUser(response.authenticatedUser);

    if (response.authenticatedUser.combinations) {
      setCombinations(response.authenticatedUser.combinations);

      if (combinationsRef && 'current' in combinationsRef) {
        combinationsRef.current = response.authenticatedUser.combinations;
      }

      await AsyncStorage.setItem(
        `@combinations_${response.authenticatedUser._id}`,
        JSON.stringify(response.authenticatedUser.combinations),
      );
    }

    navigation.navigate('Home');
  };

  const wipeLoginData = () => {
    setUsername('');
    setPassword('');
    setErrorMessages(['', '']);
    setIncorrectFields([false, false]);
    setHidePassword(true);
  };

  const handleCloseErrorModal = () => setError('');

  const handleNavigateSignUp = () => navigation.navigate('Register');

  return {
    loginData,
    incorrectFields,
    errorMessages,
    error,
    handleTogglePasswordVisibility,
    handleFieldChange,
    handleLogin,
    handleCloseErrorModal,
    handleNavigateSignUp,
  };
};

export {useLogin};
