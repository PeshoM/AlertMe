import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  NativeModules,
  NativeEventEmitter,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {styles} from '../../styles/home.styles';
import {useContext} from 'react';
import {UserContext} from '../../Context';
import BottomNavigation from '../../components/BottomNavigation';
import {useFcmToken} from '../../useFcmToken';

const HomeScreen: React.FC = () => {
  const {authenticatedUser} = useContext(UserContext);
  const {fcmToken} = useFcmToken();
  const [serviceRunning, setServiceRunning] = useState(false);
  const [lastVolumeEvent, setLastVolumeEvent] = useState<string | null>(null);

  const {VolumeServiceModule} = NativeModules;

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    // Set up event listener for volume changes
    const eventEmitter = new NativeEventEmitter(
      NativeModules.VolumeServiceModule,
    );
    const subscription = eventEmitter.addListener('VolumeEvent', event => {
      setLastVolumeEvent(`${event.action} - Volume: ${event.volume}`);
    });

    // Clean up the event listener on component unmount
    return () => {
      subscription.remove();
    };
  }, []);

  const startService = () => {
    if (Platform.OS === 'android') {
      VolumeServiceModule.startService();
      setServiceRunning(true);
    }
  };

  const stopService = () => {
    if (Platform.OS === 'android') {
      VolumeServiceModule.stopService();
      setServiceRunning(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#5a67d8" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.greetingText}>
          Hello, {authenticatedUser?.username}!
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Volume Button Monitor</Text>
          <Text style={styles.cardDescription}>
            Start the service to detect volume button presses
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                serviceRunning ? styles.runningButton : styles.startButton,
                serviceRunning && styles.disabledButton,
              ]}
              onPress={startService}
              disabled={serviceRunning}>
              <Text style={styles.buttonText}>
                {serviceRunning ? '✓ Service Running' : 'Start Service'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.stopButton,
                !serviceRunning && styles.disabledButton,
              ]}
              onPress={stopService}
              disabled={!serviceRunning}>
              <Text style={styles.buttonText}>Stop Service</Text>
            </TouchableOpacity>
          </View>

          {lastVolumeEvent && (
            <View style={styles.eventCard}>
              <Text style={styles.eventTitle}>Last Volume Event:</Text>
              <Text style={styles.eventText}>{lastVolumeEvent}</Text>
            </View>
          )}
        </View>

        {fcmToken && (
          <View style={styles.tokenCard}>
            <Text style={styles.tokenTitle}>FCM Token:</Text>
            <Text style={styles.tokenText}>{fcmToken}</Text>
          </View>
        )}
      </View>

      <BottomNavigation />
    </SafeAreaView>
  );
};

export default HomeScreen;
