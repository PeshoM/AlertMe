import React, {useContext} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  Modal,
  TextInput,
} from 'react-native';
import {styles} from '../../styles/friends.styles';
import {UserContext} from '../../Context';
import {IUser} from '../../interfaces/user.interface';
import BottomNavigation from '../../components/BottomNavigation';
import {useFriends} from './hooks/useFriends';

const FriendsScreen: React.FC = () => {
  const {authenticatedUser, receivedRequests, sentRequests, friends} =
    useContext(UserContext);
  const {
    isModalVisible,
    searchResults,
    isHovered,
    input,
    toggleModal,
    handleChange,
    handleResultLongPress,
    handleSendFriendRequest,
    handleNavigateToProfile,
  } = useFriends();

  return (
    <View style={styles.rootContainer}>
      <View>
        <SafeAreaView style={styles.notchContainer}>
          <Text style={styles.title}>AlertMe</Text>

          <Pressable onPress={() => toggleModal(true)}>
            <Image
              style={styles.searchIcon}
              source={require('../../assets/images/magnifier.png')}
            />
          </Pressable>

          <Modal
            animationType="none"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => toggleModal(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TextInput
                  onChangeText={handleChange}
                  value={input}
                  style={styles.inputField}
                  placeholder="Search"
                />
                {searchResults.length !== 0 ? (
                  searchResults.map((result: IUser, idx: number) => (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={1}
                      onPress={() => {
                        handleNavigateToProfile(result._id);
                      }}
                      onPressIn={() => handleResultLongPress(result.username)}
                      onPressOut={() => handleResultLongPress('')}
                      style={[
                        styles.result,
                        isHovered === result.username
                          ? styles.hoveredResult
                          : null,
                      ]}>
                      <Text style={styles.resultName}>
                        {result.username}
                        {authenticatedUser.username === result.username ? (
                          <Text style={styles.resultNameMatched}>(You)</Text>
                        ) : authenticatedUser.friends.includes(result._id) ? (
                          <Text style={styles.resultNameMatched}>
                            (Friends)
                          </Text>
                        ) : null}
                      </Text>
                      {authenticatedUser.receivedFriendRequests.length !== 0 &&
                      authenticatedUser.receivedFriendRequests.includes(
                        result._id,
                      ) ? (
                        <View style={styles.handleRequestText}>
                          <Text>Pending</Text>
                        </View>
                      ) : authenticatedUser.sentFriendRequests.includes(
                          result._id,
                        ) ? (
                        <Text>Sent</Text>
                      ) : authenticatedUser.username !== result.username &&
                        !authenticatedUser.friends.includes(result._id) ? (
                        <TouchableOpacity
                          onPress={() => handleSendFriendRequest(result)}>
                          <Image
                            style={styles.addFriendIcon}
                            source={require('../../assets/images/addFriend.png')}
                          />
                        </TouchableOpacity>
                      ) : null}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View>
                    <Text>No results found!</Text>
                  </View>
                )}
              </View>
            </View>
          </Modal>
        </SafeAreaView>

        <View style={styles.friendRequests}>
          {sentRequests.length !== 0 && (
            <View>
              <View style={styles.requestsMessage}>
                <Text>{`Sent requests (${sentRequests.length})`}</Text>
                {sentRequests.length > 2 && (
                  <Text style={styles.showAllMessage}>Show all</Text>
                )}
              </View>

              {sentRequests.length !== 0 && (
                <View style={styles.container}>
                  {sentRequests.length !== 0 &&
                    sentRequests.map((friend: IUser, idx: number) => (
                      <TouchableOpacity
                        activeOpacity={1}
                        key={idx}
                        style={styles.friendItem}
                        onPress={() => {
                          handleNavigateToProfile(friend._id);
                        }}>
                        <Text style={styles.friendText}>{friend.username}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>
          )}
          {receivedRequests.length !== 0 && (
            <View>
              <View style={styles.requestsMessage}>
                <Text>{`Friend requests (${receivedRequests.length})`}</Text>
                {receivedRequests.length > 2 && (
                  <Text style={styles.showAllMessage}>Show all</Text>
                )}
              </View>
              {receivedRequests.length !== 0 && (
                <View style={styles.container}>
                  {receivedRequests.length !== 0 &&
                    receivedRequests.map((friend: IUser, idx: number) => (
                      <TouchableOpacity
                        activeOpacity={1}
                        key={idx}
                        style={styles.friendItem}
                        onPress={() => {
                          handleNavigateToProfile(friend._id);
                        }}>
                        <Text style={styles.friendText}>{friend.username}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>
          )}
        </View>
        <View>
          <View>
            <View style={styles.requestsMessage}>
              <Text>{`Your friends (${friends.length}):`}</Text>
            </View>
          </View>
          <View style={styles.container}>
            {friends.length !== 0 &&
              friends.map((friend: IUser, idx: number) => (
                <TouchableOpacity
                  activeOpacity={1}
                  key={idx}
                  style={styles.friendItem}
                  onPress={() => {
                    handleNavigateToProfile(friend._id);
                  }}>
                  <Text style={styles.friendText}>{friend.username}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </View>
      <BottomNavigation />
    </View>
  );
};

export default FriendsScreen;
