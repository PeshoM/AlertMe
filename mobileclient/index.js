/**
 * @format
 */
import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import Application from './Application';
import {name as appName} from './app.json';

messaging().onNotificationOpenedApp(remoteMessage => {
  console.log('[BACKGROUND index.js] Notification Clicked:', remoteMessage);
});

messaging()
  .getInitialNotification()
  .then(remoteMessage => {
    if (remoteMessage)
      console.log('[TERMINATED index.js] Opened notification:', remoteMessage);
  });

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log(
    '[BACKGROUND index.js] Message handled in background:',
    remoteMessage,
  );
});

AppRegistry.registerComponent(appName, () => Application);
