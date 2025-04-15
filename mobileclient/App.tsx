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

interface EventListenerCleanup {
  cleanup: () => void;
}

const App = ({user}: {user: IUser | null}) => {
  const {
    authenticatedUser,
    friends,
    setFriends,
    combinationsRef,
    combinations,
    setCombinations,
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
      if (combinationsRef && 'current' in combinationsRef) {
        combinationsRef.current = combinations;
      }
    } else {
      console.warn('VolumeServiceModule.setCombinations is not available');
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

    const setupEventListeners = () => {
      const volumeModule = NativeModules.VolumeServiceModule;
      if (!volumeModule) {
        console.warn('VolumeServiceModule not available for event listeners');
        return null;
      }

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

              if (event.combinationId) {
                await triggerCombinationOnServer(event.combinationId);
              }
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
          ) {
            return;
          }

          resetSequenceTimeout();

          setButtonSequence(prev => {
            const newSequence = [...prev, event.action];
            setTimeout(() => {
              checkForMatchingCombinations(newSequence);
            }, 0);
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
      try {

        if (NativeModules.NativeCaller?.restartServiceIfNeeded) {
          await NativeModules.NativeCaller.restartServiceIfNeeded();
        } else if (NativeModules.NativeCaller?.startService) {
          NativeModules.NativeCaller.startService();
        } else {
          console.warn('No method available to start volume service');
        }

        return setupEventListeners();
      } catch (error) {
        console.error('Error starting volume service:', error);
        return null;
      }
    };

    let eventListenerCleanup: EventListenerCleanup | null = null;
    startVolumeService().then(cleanup => {
      eventListenerCleanup = cleanup;
    });

    const serviceCheckInterval = setInterval(() => {
      if (NativeModules.NativeCaller?.isServiceRunning) {
        NativeModules.NativeCaller.isServiceRunning().then(
          (running: boolean) => {
            if (!running) {
              startVolumeService().then(cleanup => {
                if (eventListenerCleanup) {
                  eventListenerCleanup.cleanup();
                }
                eventListenerCleanup = cleanup;
              });
            }
          },
        );
      }
    }, 30000);

    return () => {
      if (eventListenerCleanup) {
        eventListenerCleanup.cleanup();
      }
      clearInterval(serviceCheckInterval);
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }
    };
  }, [user]);

  const loadCombinations = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');

      if (!token || !userData) return;

      const parsedUserData = JSON.parse(userData);
      if (!parsedUserData?._id) return;

      const friendsData = await AsyncStorage.getItem('friends_data');
      if (friendsData) {
        try {
          const parsedFriends = JSON.parse(friendsData);
          if (Array.isArray(parsedFriends)) {
            const validFriends = parsedFriends.filter(
              friend => friend && friend._id && friend.username,
            );

            if (validFriends.length > 0) {
              setFriends(validFriends);

              if (Platform.OS === 'android') {
                const volumeModule = NativeModules.VolumeServiceModule;
                if (volumeModule?.setFriends) {
                  volumeModule.setFriends(validFriends);
                } else {
                  console.warn(
                    'VolumeServiceModule.setFriends is not available',
                  );
                }
              }
            } else {
              console.log('No valid friends found in stored data');
            }
          }
        } catch (e) {
          console.error('Error parsing friends data:', e);
        }
      } else {
        console.log('No friends data in storage');
      }

      const localCombinationsKey = `@combinations_${parsedUserData._id}`;
      const localCombinations = await AsyncStorage.getItem(
        localCombinationsKey,
      );

      if (localCombinations) {
        try {
          const parsedCombinations = JSON.parse(localCombinations);

          setCombinations(parsedCombinations);
          if (combinationsRef && 'current' in combinationsRef) {
            combinationsRef.current = parsedCombinations;
          }

          if (Platform.OS === 'android') {
            const volumeModule = NativeModules.VolumeServiceModule;
            if (volumeModule?.setCombinations) {
              volumeModule.setCombinations(parsedCombinations);
            } else {
              console.warn(
                'VolumeServiceModule.setCombinations is not available',
              );
            }
          }
        } catch (e) {
          console.error('Error parsing combinations data:', e);
        }
      } else {
        console.log('No combinations found in storage');
      }
    } catch (error) {
      console.error('Error in loadCombinations:', error);
    }
  };

  const checkForMatchingCombinations = async (sequence: string[]) => {
    if (sequence.length < 3) return;

    const availableCombinations = combinationsRef?.current || [];

    if (availableCombinations.length === 0) {
      console.warn('No combinations available to match against');
      return;
    }

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
    try {
      const authToken = await AsyncStorage.getItem('auth_token');
      if (!authToken) {
        console.error('No auth token found');
        return false;
      }

      if (!user?._id) {
        console.error('No user ID available');
        return false;
      }

      const apiUrl = `${SERVER_URL}${TRIGGER_COMBINATION}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          userId: user._id,
          combinationId,
        }),
      });

      if (!response.ok) {
        console.error(
          `Server responded with ${response.status}: ${response.statusText}`,
        );
        return false;
      }

      if (Platform.OS === 'android') {
        Vibration.vibrate(100);
      }

      return true;
    } catch (error) {
      console.error('Error triggering combination:', error);
      return false;
    }
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
