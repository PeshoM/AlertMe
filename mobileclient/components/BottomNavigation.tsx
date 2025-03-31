import React from 'react';
import {
  NavigationProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {View, Text, TouchableOpacity} from 'react-native';
import {StyleSheet} from 'react-native';
import {AppParamList} from '../types/app.param.list';

const BottomNavigation = () => {
  const navigation = useNavigation<NavigationProp<AppParamList>>();
  const route = useRoute();
  const currentScreen = route.name;

  const handlePressDashboard = () => {
    navigation.navigate('Home');
  };
  const handlePressFriends = () => {
    navigation.navigate('Friends');
  };

  const handlePressPersonal = () => {
    navigation.navigate('Personal');
  };

  return (
    <View style={styles.bottomNavigation}>
      <TouchableOpacity onPress={handlePressPersonal} style={styles.navButton}>
        <Text
          style={[
            styles.navLabel,
            currentScreen === 'Personal' && styles.activeNavLabel,
          ]}>
          Profile
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handlePressDashboard} style={styles.navButton}>
        <Text
          style={[
            styles.navLabel,
            currentScreen === 'Home' && styles.activeNavLabel,
          ]}>
          Dashboard
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handlePressFriends} style={styles.navButton}>
        <Text
          style={[
            styles.navLabel,
            currentScreen === 'Friends' && styles.activeNavLabel,
          ]}>
          Friends
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  navLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  activeNavLabel: {
    fontSize: 18,
    color: '#5a67d8',
    fontWeight: '700',
  },
});

export default BottomNavigation;
