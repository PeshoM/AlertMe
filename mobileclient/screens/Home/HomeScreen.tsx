import React, {useEffect} from 'react';
import {View, Text, Button} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {styles} from '../../styles/home.styles';
import {useContext} from 'react';
import {UserContext} from '../../Context';
import BottomNavigation from '../../components/BottomNavigation';
import {useFcmToken} from '../../useFcmToken';

const HomeScreen: React.FC = () => {
  const {authenticatedUser} = useContext(UserContext);
  const {fcmToken} = useFcmToken();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileSection}>
        <Text style={styles.greetingText}>
          Hello, {authenticatedUser?.username}!
        </Text>
      </View>
      <View style={styles.separator} />

      <View style={styles.content}>
        <Text>{fcmToken}</Text>
      </View>

      <BottomNavigation />
    </SafeAreaView>
  );
};

export default HomeScreen;
