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
  FlatList,
  StatusBar,
} from 'react-native';
import {styles} from '../../styles/friends.styles';
import {UserContext} from '../../Context';
import {IUser} from '../../interfaces/user.interface';
import BottomNavigation from '../../components/BottomNavigation';
import {useFriends} from './hooks/useFriends';

interface FriendItemProps {
  user: IUser;
  onPress: () => void;
}

const FriendItem = ({user, onPress}: FriendItemProps) => (
  <TouchableOpacity
    activeOpacity={0.8}
    style={styles.friendItem}
    onPress={onPress}>
    <View style={styles.friendAvatarContainer}>
      <Text style={styles.friendAvatar}>
        {user.username.charAt(0).toUpperCase()}
      </Text>
    </View>
    <Text style={styles.friendText}>{user.username}</Text>
  </TouchableOpacity>
);

interface SectionHeaderProps {
  title: string;
  count: number;
  onShowAll: () => void;
}

const SectionHeader = ({title, count, onShowAll}: SectionHeaderProps) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{`${title} (${count})`}</Text>
    {count > 2 && (
      <TouchableOpacity onPress={onShowAll}>
        <Text style={styles.sectionAction}>Show all</Text>
      </TouchableOpacity>
    )}
  </View>
);

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
      <StatusBar backgroundColor="#5a67d8" barStyle="light-content" />
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Friends</Text>
          <Pressable
            style={styles.searchButton}
            onPress={() => toggleModal(true)}>
            <Image
              style={styles.searchIcon}
              source={require('../../assets/images/magnifier.png')}
            />
          </Pressable>
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {/* Sent Requests Section */}
        {sentRequests.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Sent requests"
              count={sentRequests.length}
              onShowAll={() => {}}
            />
            <FlatList
              data={sentRequests.slice(0, 2)}
              keyExtractor={item => item._id}
              renderItem={({item}) => (
                <FriendItem
                  user={item}
                  onPress={() => handleNavigateToProfile(item._id)}
                />
              )}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        )}

        {/* Received Requests Section */}
        {receivedRequests.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Friend requests"
              count={receivedRequests.length}
              onShowAll={() => {}}
            />
            <FlatList
              data={receivedRequests.slice(0, 2)}
              keyExtractor={item => item._id}
              renderItem={({item}) => (
                <FriendItem
                  user={item}
                  onPress={() => handleNavigateToProfile(item._id)}
                />
              )}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        )}

        {/* Friends Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Your friends"
            count={friends.length}
            onShowAll={() => {}}
          />
          <FlatList
            data={friends}
            keyExtractor={item => item._id}
            renderItem={({item}) => (
              <FriendItem
                user={item}
                onPress={() => handleNavigateToProfile(item._id)}
              />
            )}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      </View>

      {/* Search Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={isModalVisible}
        onRequestClose={() => toggleModal(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Search Users</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => toggleModal(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.searchContainer}>
              <TextInput
                onChangeText={handleChange}
                value={input}
                style={styles.inputField}
                placeholder="Search by username"
                placeholderTextColor="#9ca3af"
                autoFocus
              />
            </View>

            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => `${item._id}-${index}`}
              renderItem={({item}) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    handleNavigateToProfile(item._id);
                    toggleModal(false);
                  }}
                  onPressIn={() => handleResultLongPress(item.username)}
                  onPressOut={() => handleResultLongPress('')}
                  style={[
                    styles.result,
                    isHovered === item.username && styles.hoveredResult,
                  ]}>
                  <View style={styles.resultInfo}>
                    <View style={styles.resultAvatarContainer}>
                      <Text style={styles.resultAvatar}>
                        {item.username.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.resultName}>{item.username}</Text>
                      {authenticatedUser.username === item.username && (
                        <Text style={styles.resultBadge}>(You)</Text>
                      )}
                      {authenticatedUser.friends.includes(item._id) && (
                        <Text style={styles.resultBadge}>(Friends)</Text>
                      )}
                    </View>
                  </View>

                  {authenticatedUser.receivedFriendRequests.includes(
                    item._id,
                  ) ? (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingText}>Pending</Text>
                    </View>
                  ) : authenticatedUser.sentFriendRequests.includes(
                      item._id,
                    ) ? (
                    <View style={styles.sentBadge}>
                      <Text style={styles.sentText}>Sent</Text>
                    </View>
                  ) : authenticatedUser.username !== item.username &&
                    !authenticatedUser.friends.includes(item._id) ? (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleSendFriendRequest(item)}>
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  ) : null}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No users found</Text>
                </View>
              }
            />
          </View>
        </SafeAreaView>
      </Modal>

      <BottomNavigation />
    </View>
  );
};

export default FriendsScreen;
