import React, {useEffect} from 'react';
import {View, Text, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {styles} from '../../styles/home.styles';
import {useContext} from 'react';
import {UserContext} from '../../Context';
import BottomNavigation from '../../components/BottomNavigation';
import {useFriends} from '../Friends/hooks/useFriends';

const HomeScreen: React.FC = () => {
  const {authenticatedUser} = useContext(UserContext);
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
      </View>

      <BottomNavigation />
    </SafeAreaView>
  );
};

export default HomeScreen;
