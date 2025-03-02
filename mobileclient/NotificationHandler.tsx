import React, {useEffect, useContext} from 'react';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';
import {navigationRef} from './NavigationService';
import {AppParamList} from './types/app.param.list';
import {UserContext} from './Context';
import {IUser} from './interfaces/user.interface';

const isValidScreen = (screen: unknown): screen is keyof AppParamList => {
  return (
    typeof screen === 'string' &&
    ['Home', 'Friends', 'Login', 'Register', 'Profile'].includes(screen)
  );
};

const NotificationHandler: React.FC = () => {
  const {
    setAuthenticatedUser,
    setFriends,
    setReceivedRequests,
    setSentRequests,
  } = useContext(UserContext);

  const handleAcceptedFriendRequest = async (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    const openedUser: IUser = await JSON.parse(
      remoteMessage.data?.currUser as string,
    );
    setAuthenticatedUser(prevUser => {
      if (prevUser) {
        return {
          ...prevUser,
          sentFriendRequests: prevUser.sentFriendRequests.filter(
            id => id !== openedUser._id,
          ),
          friends: [...prevUser.friends, openedUser._id],
        };
      }
      return prevUser;
    });
    setSentRequests(prevRequests =>
      prevRequests.filter(request => request._id !== openedUser._id),
    );
    setFriends(prevFriends => [...prevFriends, openedUser]);
  };

  const handleRejectedFriendRequest = async (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    const openedUser: IUser = await JSON.parse(
      remoteMessage.data?.currUser as string,
    );
    setAuthenticatedUser(prevUser => {
      if (prevUser) {
        return {
          ...prevUser,
          sentFriendRequests: prevUser.sentFriendRequests.filter(
            id => id !== openedUser._id,
          ),
        };
      }
      return prevUser;
    });
    setSentRequests(prevRequests =>
      prevRequests.filter(request => request._id !== openedUser._id),
    );
  };

  const handleSentFriendRequest = async (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    const openedUser: IUser = await JSON.parse(
      remoteMessage.data?.currUser as string,
    );
    setAuthenticatedUser(prevUser => {
      if (prevUser) {
        return {
          ...prevUser,
          receivedFriendRequests: [
            ...prevUser.receivedFriendRequests,
            openedUser._id,
          ],
        };
      }
      return prevUser;
    });
    setReceivedRequests(prevRequests => [...prevRequests, openedUser]);
  };

  const handleRemovedFriend = async (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    const openedUser: IUser = await JSON.parse(
      remoteMessage.data?.currUser as string,
    );
    setAuthenticatedUser(prevUser => {
      if (prevUser) {
        return {
          ...prevUser,
          friends: prevUser.friends.filter(id => id !== openedUser._id),
        };
      }
      return prevUser;
    });
    setFriends(prevFriends =>
      prevFriends.filter(friend => friend._id !== openedUser._id),
    );
  };

  const interactionMap: Record<
    string,
    (remoteMessage: any, currUserId: string) => void
  > = {
    ACCEPTED: handleAcceptedFriendRequest,
    REJECTED: handleRejectedFriendRequest,
    REQUEST: handleSentFriendRequest,
    REMOVED: handleRemovedFriend,
  };
  useEffect(() => {
    const requestPermissions = async () => {
      await notifee.requestPermission();
      await messaging().requestPermission();
      await notifee.createChannel({id: 'default', name: 'Default Channel'});
    };

    requestPermissions();

    // Foreground Notification
    messaging().onMessage(async remoteMessage => {
      const status = remoteMessage.data?.status as string;
      if (status) {
        if (remoteMessage.data) {
          interactionMap[status](
            remoteMessage,
            remoteMessage.data.currUserId as string,
          );
        }
      }

      if (remoteMessage.notification) {
        await notifee.displayNotification({
          title: remoteMessage.notification?.title || 'New Message',
          body:
            remoteMessage.notification?.body || 'You have a new notification!',
          android: {
            channelId: 'default',
            pressAction: {id: 'default', launchActivity: 'default'},
          },
          data: remoteMessage.data,
        });
      }
    });

    // Handle Notification Tap (Background)
    const unsubscribeOnNotificationOpened = messaging().onNotificationOpenedApp(
      remoteMessage => {
        handleNotificationNavigation(remoteMessage);
      },
    );

    // Handle Foreground Notification Tap
    const unsubscribeNotifee = notifee.onForegroundEvent(({type, detail}) => {
      if (type === EventType.PRESS && detail.notification) {
        handleNotificationNavigation(detail.notification);
      }
    });

    return () => {
      unsubscribeOnNotificationOpened();
      unsubscribeNotifee();
    };
  }, []);

  useEffect(() => {
    const checkInitialNotification = async () => {
      const remoteMessage = await messaging().getInitialNotification();
      if (remoteMessage) {
        setTimeout(() => handleNotificationNavigation(remoteMessage), 1500);
      }
    };

    checkInitialNotification();
  }, []);

  const handleNotificationNavigation = (message: any) => {
    const screen = message?.data?.screen;
    if (screen && isValidScreen(screen)) {
      setTimeout(() => {
        if (navigationRef.current?.isReady()) {
          if (screen === 'Profile') {
            navigationRef.current.navigate(screen, {
              openedUserId: message.data.openedUserId,
            });
          } else {
            navigationRef.current.navigate(screen);
          }
        }
      }, 1000);
    }
  };

  return null;
};

export default NotificationHandler;
