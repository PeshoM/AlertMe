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
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingIndicator}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.rootContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitial}>
            {openedUser.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.username}>{openedUser.username}</Text>

        {authenticatedUser.friends.includes(openedUser._id) && (
          <View style={styles.friendStatusBadge}>
            <Text style={styles.friendStatusText}>Friends</Text>
          </View>
        )}
      </View>

      <View style={styles.actionContainer}>
        {authenticatedUser.receivedFriendRequests.includes(openedUser._id) ? (
          <View style={styles.requestActionContainer}>
            <Text style={styles.requestPendingText}>
              Friend Request Received
            </Text>
            <View style={styles.handleRequestContainer}>
              <TouchableOpacity
                style={[styles.optionButton, styles.acceptButton]}
                onPress={() => handleAcceptFriendRequest(openedUser)}>
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, styles.rejectButton]}
                onPress={() => handleRejectFriendRequest(openedUser)}>
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : authenticatedUser.sentFriendRequests.includes(openedUser._id) ? (
          <View style={styles.pendingContainer}>
            <Text style={styles.pendingText}>Friend Request Sent</Text>
            <Text style={styles.pendingSubtext}>Waiting for response</Text>
          </View>
        ) : !authenticatedUser.friends.includes(openedUser._id) ? (
          <TouchableOpacity
            style={styles.addFriendButton}
            onPress={() => handleSendFriendRequest(openedUser)}>
            <Text style={styles.buttonText}>Send Friend Request</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.removeFriendButton}
            onPress={() => handleRemoveFriend(openedUser)}>
            <Text style={styles.buttonText}>Remove Friend</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
