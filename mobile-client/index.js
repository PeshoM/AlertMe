import { registerRootComponent } from "expo";
import App from "./App";
import messaging from "@react-native-firebase/messaging";
import { navigationRef } from "./NavigationService";

// Firebase background handler setup
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("Background Message: ", remoteMessage);
  // Check and navigate if the app is opened via a notification

  if (remoteMessage.data?.screen) {
    navigationRef.current?.navigate(remoteMessage.data.screen);
  }
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
