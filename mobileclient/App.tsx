import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './AppNavigator';
import {navigationRef} from './NavigationService';
import NotificationHandler from './NotificationHandler';
import {Context} from './Context';

const App = () => {
  return (
    <Context>
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
        <NotificationHandler />
      </NavigationContainer>
    </Context>
  );
};

export default App;
