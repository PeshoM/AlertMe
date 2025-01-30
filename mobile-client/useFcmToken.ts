import messaging from "@react-native-firebase/messaging";
import { useEffect, useState } from "react";

export const useFcmToken = () => {
  const [fcmToken, setFcmToken] = useState("");

  useEffect(() => {
    const getFcmToken = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const token = await messaging().getToken();
        setFcmToken(token);
        console.log("FCM Token:", token);
      } else {
        console.warn("Push notification permission not granted.");
      }
    };

    getFcmToken();

    const unsubscribeOnTokenRefresh = messaging().onTokenRefresh((token) => {
      setFcmToken(token);
      console.log("Token refreshed:", token);
    });

    return () => {
      unsubscribeOnTokenRefresh();
    };
  }, []);

  return { fcmToken };
};
