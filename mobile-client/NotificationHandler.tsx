import React, { ReactNode, useEffect } from "react";
import messaging from "@react-native-firebase/messaging";
import { NotificationHandlerProps } from "./types/screen.props";
import { navigationRef } from "./NavigationService"; // Global navigation ref
import { AppParamList } from "./types/app.param.list";

// Define a list of valid screen names
const validScreens: (keyof AppParamList)[] = [
  "Home",
  "Friends",
  "Login",
  "Register",
];

const NotificationHandler: React.FC<NotificationHandlerProps> = ({
  children,
}) => {
  useEffect(() => {
    // Check if the app was opened by a notification
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          handleNotification(remoteMessage.data);
        }
      });

    // Listener for when the app is in the background or closed
    const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp(
      (remoteMessage) => {
        if (remoteMessage) {
          handleNotification(remoteMessage.data);
        }
      }
    );

    // Listener for when a notification is received while the app is in the foreground
    const unsubscribeForegroundNotifications = messaging().onMessage(
      (remoteMessage) => {
        console.log("Notification received in foreground:", remoteMessage);
      }
    );

    return () => {
      unsubscribeNotificationOpened();
      unsubscribeForegroundNotifications();
    };
  }, []);

  const handleNotification = (data: any) => {
    const { screen, ...params } = data || {};

    // Ensure screen is a valid key in validScreens
    if (
      screen &&
      validScreens.includes(screen as keyof AppParamList) &&
      navigationRef.current
    ) {
      navigationRef.current.navigate(screen as keyof AppParamList, params);
    } else {
      console.warn("Invalid screen or params", data);
    }
  };

  return <>{children(navigationRef)}</>;
};

export default NotificationHandler;
