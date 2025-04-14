import React, {useState, useEffect, useContext} from 'react';
import App from './App';
import {SERVER_URL, GET_AUTHENTICATED_USER} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {UserContext} from './Context';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import {IUser} from './interfaces/user.interface';

const Application = () => {
  const {setAuthenticatedUser, setCombinations, combinationsRef} =
    useContext(UserContext);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    getAuthenticatedUser();
  }, []);

  const getAuthenticatedUser = async () => {
    const storedToken = await AsyncStorage.getItem('auth_token');

    if (!storedToken) {
      setIsAuthLoading(false);
      return;
    }

    const getAuthUserUrl = `${SERVER_URL}${GET_AUTHENTICATED_USER}`;

    const response = await fetch(getAuthUserUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: storedToken,
      }),
    }).then(res => res.json());

    if (!response.authenticatedUser) {
      setIsAuthLoading(false);
      return;
    }

    setUser(response.authenticatedUser);
    setAuthenticatedUser(response.authenticatedUser);
    setIsAuthLoading(false);

    if (response.authenticatedUser.combinations) {
      setCombinations(response.authenticatedUser.combinations);

      if (combinationsRef && 'current' in combinationsRef) {
        combinationsRef.current = response.authenticatedUser.combinations;
      }
    }
  };

  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  } else return user ? <App user={user} /> : <App user={null} />;
};

export default Application;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
});
