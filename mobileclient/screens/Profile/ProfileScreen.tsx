import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {ProfileScreenProps} from '../../types/screen.props';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useContext} from 'react';
import {styles} from '../../styles/profile.styles';
import {UserContext} from '../../Context';
import {useProfile} from './hooks/useProfile';

const ProfileScreen: React.FC<ProfileScreenProps> = ({route}) => {
  const {authenticatedUser} = useContext(UserContext);
  const {
    openedUser,
    handleSendFriendRequest,
    handleRemoveFriend,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
  } = useProfile({route});

  if (!openedUser) {
    return (
      <View>
        <Text>Loading</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.rootContainer}>
      <View style={styles.friendUsernameContainer}>
        <Text style={styles.friendUsername}>{openedUser.username}</Text>
      </View>
      {authenticatedUser.friends.includes(openedUser._id) && (
        <Text style={styles.alreadyFriends}>You are friends</Text>
      )}
      <View>
        {authenticatedUser.receivedFriendRequests.includes(openedUser._id) ? (
          <View style={styles.handleRequestContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleAcceptFriendRequest(openedUser)}>
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, styles.rejectButton]}
              onPress={() => handleRejectFriendRequest(openedUser)}>
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        ) : authenticatedUser.sentFriendRequests.includes(openedUser._id) ? (
          <Text style={styles.alreadyFriends}>Request Sent</Text>
        ) : !authenticatedUser.friends.includes(openedUser._id) ? (
          <TouchableOpacity
            style={styles.addFriendButton}
            onPress={() => handleSendFriendRequest(openedUser)}>
            <Text style={styles.buttonText}>Send Friend Request</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.addFriendButton}
            onPress={() => handleRemoveFriend(openedUser)}>
            <Text style={styles.buttonText}>Remove Friend</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
