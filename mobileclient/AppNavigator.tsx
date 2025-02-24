import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AppParamList} from './types/app.param.list';
import HomeScreen from './screens/Home/HomeScreen';
import FriendsScreen from './screens/Friends/FriendsScreen';
import LoginScreen from './screens/Login/LoginScreen';
import RegisterScreen from './screens/Register/RegisterScreen';
import ProfileScreen from './screens/Profile/ProfileScreen';

const Stack = createNativeStackNavigator<AppParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
