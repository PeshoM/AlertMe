import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainerRef } from "@react-navigation/native";
import FriendsScreen from "./screens/Friends/FriendsScreen";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/Login/LoginScreen";
import RegisterScreen from "./screens/Register/RegisterScreen";
import { AppParamList } from "./types/app.param.list";
import { AppNavigatorProps } from "./types/screen.props";

const Stack = createNativeStackNavigator<AppParamList>(); // Using Native Stack Navigator

const AppNavigator: React.FC<AppNavigatorProps> = ({ navigationRef }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
