import React, {useEffect} from 'react';
import {View, Text, TouchableOpacity, StatusBar, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {styles} from '../../styles/home.styles';
import {useContext} from 'react';
import {UserContext} from '../../Context';
import BottomNavigation from '../../components/BottomNavigation';
import {useFcmToken} from '../../useFcmToken';
import {useFriends} from '../Friends/hooks/useFriends';

const HomeScreen: React.FC = () => {
  const {authenticatedUser, setFriends, setReceivedRequests, setSentRequests} =
    useContext(UserContext);
  const {fcmToken} = useFcmToken();
  const {handleFetchFriends} = useFriends();

  useEffect(() => {
    handleFetchFriends();
  }, []);

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
          <Text style={styles.cardTitle}>Welcome to AlertMe</Text>
          <Text style={styles.cardDescription}>
            Use the Profile tab to create alert combinations with volume buttons
          </Text>
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
