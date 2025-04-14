import React, {useEffect, useState, useRef, useContext} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './AppNavigator';
import {navigationRef} from './NavigationService';
import NotificationHandler from './NotificationHandler';
import {Context, UserContext} from './Context';
import {
  NativeModules,
  NativeEventEmitter,
  Platform,
  Vibration,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SERVER_URL, TRIGGER_COMBINATION} from '@env';
import {IUser} from './interfaces/user.interface';

const App = ({user}: {user: IUser | null}) => {
  const {
    authenticatedUser,
    friends,
    setFriends,
    combinationsRef,
    combinations,
  } = useContext(UserContext);

  const [buttonSequence, setButtonSequence] = useState<string[]>([]);
  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    let eventListenerCleanup: {cleanup: () => void} | null = null;

    const setupEventListeners = () => {
      const volumeModule = NativeModules.VolumeServiceModule;
      if (!volumeModule) return null;

      const eventEmitter = new NativeEventEmitter(volumeModule);
      eventEmitter.removeAllListeners('VolumeEvent');
      eventEmitter.removeAllListeners('CombinationEvent');

      const combinationSubscription = eventEmitter.addListener(
        'CombinationEvent',
        event => {
          if (event?.action === 'combinationMatched') {
            (async () => {
              setButtonSequence([]);
              if (sequenceTimeoutRef.current) {
                clearTimeout(sequenceTimeoutRef.current);
                sequenceTimeoutRef.current = null;
              }

              const authToken = await AsyncStorage.getItem('auth_token');
              const apiUrl = `${SERVER_URL}${TRIGGER_COMBINATION}`;

              await fetch(apiUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${authToken || ''}`,
                },
                body: JSON.stringify({
                  userId: user._id,
                  combinationId: event.combinationId,
                }),
              });
            })();
          }
        },
      );

      const volumeSubscription = eventEmitter.addListener(
        'VolumeEvent',
        event => {
          if (
            !event?.action ||
            event.action === 'serviceStarted' ||
            event.action === 'resetSequence'
          )
            return;

          resetSequenceTimeout();

          setButtonSequence(prev => {
            const newSequence = [...prev, event.action];
            checkForMatchingCombinations(newSequence);
            return newSequence.slice(-10);
          });
        },
      );

      return {
        cleanup: () => {
          volumeSubscription.remove();
          combinationSubscription.remove();
        },
      };
    };

    const startVolumeService = async () => {
      if (NativeModules.NativeCaller?.restartServiceIfNeeded) {
        await NativeModules.NativeCaller.restartServiceIfNeeded();
      } else if (NativeModules.NativeCaller?.startService) {
        NativeModules.NativeCaller.startService();
      }
      eventListenerCleanup = setupEventListeners();
    };

    startVolumeService();
    const serviceCheckInterval = setInterval(() => {
      if (NativeModules.NativeCaller?.isServiceRunning) {
        NativeModules.NativeCaller.isServiceRunning().then(
          (running: boolean) => {
            if (!running && authenticatedUser?._id) startVolumeService();
          },
        );
      }
    }, 30000);

    return () => {
      if (eventListenerCleanup) eventListenerCleanup.cleanup();
      clearInterval(serviceCheckInterval);
      if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
    };
  }, [authenticatedUser]);

  const resetSequenceTimeout = () => {
    if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
    sequenceTimeoutRef.current = setTimeout(() => {
      setButtonSequence([]);
      sequenceTimeoutRef.current = null;
    }, 600);
  };

  useEffect(() => {
    if (Platform.OS !== 'android' || !combinations?.length) return;

    const volumeModule = NativeModules.VolumeServiceModule;
    if (volumeModule?.setCombinations) {
      volumeModule.setCombinations(combinations);
    }
  }, [combinations]);

  useEffect(() => {
    if (Platform.OS !== 'android' || !friends?.length) return;

    const volumeModule = NativeModules.VolumeServiceModule;
    if (volumeModule?.setFriends) {
      volumeModule.setFriends(friends);
    }
  }, [friends]);

  useEffect(() => {
    loadCombinations();
    return () => {
      if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const startVolumeServices = () => {
      if (NativeModules.NativeCaller?.restartServiceIfNeeded) {
        NativeModules.NativeCaller.restartServiceIfNeeded().catch(() => {
          setTimeout(() => {
            if (NativeModules.NativeCaller?.startService) {
              NativeModules.NativeCaller.startService();
            }
          }, 1000);
        });
      } else if (NativeModules.NativeCaller?.startService) {
        NativeModules.NativeCaller.startService();
      }
    };

    setTimeout(startVolumeServices, 1000);

    const volumeModule = NativeModules.VolumeServiceModule;
    if (!volumeModule) return;

    const eventEmitter = new NativeEventEmitter(volumeModule);
    eventEmitter.removeAllListeners('VolumeEvent');
    eventEmitter.removeAllListeners('CombinationEvent');

    const combinationSubscription = eventEmitter.addListener(
      'CombinationEvent',
      event => {
        if (event?.action === 'combinationMatched') {
          setButtonSequence([]);
          if (sequenceTimeoutRef.current) {
            clearTimeout(sequenceTimeoutRef.current);
            sequenceTimeoutRef.current = null;
          }
        }
      },
    );

    const volumeSubscription = eventEmitter.addListener(
      'VolumeEvent',
      event => {
        if (
          !event?.action ||
          event.action === 'serviceStarted' ||
          event.action === 'resetSequence'
        )
          return;

        resetSequenceTimeout();

        setButtonSequence(prev => {
          const newSequence = [...prev, event.action];
          checkForMatchingCombinations(newSequence);
          return newSequence.slice(-10);
        });
      },
    );

    const serviceCheckInterval = setInterval(() => {
      if (NativeModules.NativeCaller?.isServiceRunning) {
        NativeModules.NativeCaller.isServiceRunning().then(
          (running: boolean) => {
            if (!running) startVolumeServices();
          },
        );
      }
    }, 30000);

    return () => {
      volumeSubscription.remove();
      combinationSubscription.remove();
      clearInterval(serviceCheckInterval);
      if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
    };
  }, []);

  const loadCombinations = async () => {
    const token = await AsyncStorage.getItem('auth_token');
    const userData = await AsyncStorage.getItem('user_data');

    if (!token || !userData) return;

    const parsedUserData = JSON.parse(userData);
    if (!parsedUserData?._id) return;

    const friendsData = await AsyncStorage.getItem('friends_data');
    if (friendsData) {
      const parsedFriends = JSON.parse(friendsData);
      setFriends(parsedFriends);

      if (Platform.OS === 'android') {
        const volumeModule = NativeModules.VolumeServiceModule;
        volumeModule?.setFriends?.(parsedFriends);
      }
    }

    const localCombinationsKey = `@combinations_${parsedUserData._id}`;
    const localCombinations = await AsyncStorage.getItem(localCombinationsKey);

    if (localCombinations) {
      const parsedCombinations = JSON.parse(localCombinations);
      if (Platform.OS === 'android') {
        const volumeModule = NativeModules.VolumeServiceModule;
        volumeModule?.setCombinations?.(parsedCombinations);
      }
    }
  };

  const checkForMatchingCombinations = async (sequence: string[]) => {
    if (sequence.length < 3) return;

    const availableCombinations = combinationsRef?.current || [];

    for (const combination of availableCombinations) {
      if (combination.sequence.length > sequence.length) continue;

      const endOfSequence = sequence.slice(-combination.sequence.length);
      const isMatch = combination.sequence.every(
        (event: string, index: number) => event === endOfSequence[index],
      );

      if (isMatch) {
        await triggerCombinationOnServer(combination.id);
        setButtonSequence([]);
        if (sequenceTimeoutRef.current) {
          clearTimeout(sequenceTimeoutRef.current);
          sequenceTimeoutRef.current = null;
        }
        break;
      }
    }
  };

  const triggerCombinationOnServer = async (combinationId: string) => {
    const authToken = await AsyncStorage.getItem('auth_token');
    const apiUrl = `${SERVER_URL}${TRIGGER_COMBINATION}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken || ''}`,
      },
      body: JSON.stringify({
        userId: user?._id,
        combinationId,
      }),
    });

    if (!response.ok) return false;

    if (Platform.OS === 'android') {
      Vibration.vibrate(100);
    }

    return true;
  };

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
