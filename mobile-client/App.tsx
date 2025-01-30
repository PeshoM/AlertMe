import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./AppNavigator"; // Import your app's navigator
import NotificationHandler from "./NotificationHandler"; // Import NotificationHandler
import { navigationRef } from "./NavigationService"; // Import your global navigation reference
import { Context } from "./Context"; // Import Context

const App = () => {
  return (
    <Context>
      {/* Wrap the whole app in the Context provider */}
      <NavigationContainer ref={navigationRef}>
        <NotificationHandler>
          {(navigationRef) => <AppNavigator navigationRef={navigationRef} />}
        </NotificationHandler>
      </NavigationContainer>
    </Context>
  );
};

export default App;
