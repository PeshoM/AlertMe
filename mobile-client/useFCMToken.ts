import messaging from "@react-native-firebase/messaging";
import { Alert } from "react-native";
import { useEffect, useState } from "react";

const useFCMToken = () => {
  const [FCMToken, setFCMToken] = useState<string>("");

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
    }
  };

  useEffect(() => {
    if (requestUserPermission()) {
      messaging()
        .getToken()
        .then((token) => {
          setFCMToken(token);
        });
    }

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      Alert.alert("A new FCM message arrived!", JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  return { FCMToken };
};

export { useFCMToken };
