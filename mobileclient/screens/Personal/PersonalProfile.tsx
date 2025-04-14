import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import BottomNavigation from '../../components/BottomNavigation';
import {styles} from '../../styles/personalProfile.styles';
import {usePersonalProfile} from './Hooks/usePersonalProfile';
import {
  Combination,
  SavedSequence,
} from '../../interfaces/combination.interface';

const PersonalProfile: React.FC = () => {
  const {
    serviceRunning,
    buttonSequence,
    savedSequences,
    combinations,
    isSubmitting,
    nameInputRef,
    messageInputRef,
    toggleService,
    loadSequence,
    clearSequence,
    saveCombination,
    saveSequence,
    deleteCombination,
    deleteSequence,
    authenticatedUser,
    friends,
    combinationModalVisible,
    setCombinationModalVisible,
    saveModalVisible,
    setSaveModalVisible,
    sequenceName,
    setSequenceName,
    selectedFriends,
    setSelectedFriends,
    editingCombinationId,
    openCombinationModal,
    closeModal,
    openSaveModal,
    handleSaveCombination,
    handleSaveSequence,
    handleDeleteSequence,
  } = usePersonalProfile();

  const renderCombinationItem = ({item}: {item: Combination}) => {
    const targetFriend = friends.find(friend => friend._id === item.target);

    return (
      <View style={styles.savedSequenceItem}>
        <View style={styles.savedSequenceInfo}>
          <Text style={styles.savedSequenceName}>Combination: {item.name}</Text>
          <Text style={styles.savedSequenceDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.targetContainer}>
          <Text style={styles.targetLabel}>Friends to alert: </Text>
          <Text style={styles.targetName}>
            {targetFriend?.username || 'Unknown Friend'}
          </Text>
        </View>

        {item.message && item.message.trim() !== '' && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageLabel}>Message: </Text>
            <Text style={styles.messageText}>{item.message}</Text>
          </View>
        )}

        <View style={styles.savedSequenceButtons}>
          {item.sequence.map((button: string, index: number) => (
            <View
              key={index}
              style={[
                styles.miniSequenceButton,
                button === 'volumeUp'
                  ? styles.volumeUpButton
                  : styles.volumeDownButton,
              ]}>
              <Text style={styles.miniSequenceButtonText}>
                {button === 'volumeUp' ? '▲' : '▼'}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.savedSequenceActions}>
          <TouchableOpacity
            style={[styles.loadButton, styles.editButton]}
            onPress={() => openCombinationModal(item)}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteCombination(item.id)}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const CreateCombinationModal = () => {
    const [nameValue, setNameValue] = useState('');
    const [messageValue, setMessageValue] = useState('');
    const [valuesInitialized, setValuesInitialized] = useState(false);

    React.useEffect(() => {
      if (combinationModalVisible && !valuesInitialized) {
        setNameValue(nameInputRef.current);
        setMessageValue(messageInputRef.current);
        setValuesInitialized(true);
      }
    }, [combinationModalVisible, valuesInitialized]);

    const handleNameChange = (text: string) => {
      setNameValue(text);
      nameInputRef.current = text;
    };

    const handleMessageChange = (text: string) => {
      setMessageValue(text);
      messageInputRef.current = text;
    };

    const toggleFriendSelect = (friendId: string) => {
      setSelectedFriends((prev: string[]) =>
        prev.includes(friendId)
          ? prev.filter((id: string) => id !== friendId)
          : [...prev, friendId],
      );
    };

    const handleCloseModal = () => {
      closeModal();
      setValuesInitialized(false);
    };

    const handleSaveButtonPress = () => handleSaveCombination();

    const saveButtonDisabled =
      isSubmitting ||
      buttonSequence.length === 0 ||
      selectedFriends.length === 0 ||
      !nameValue.trim();

    return (
      <Modal
        visible={combinationModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {isSubmitting && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#4C51BF" />
                <Text style={styles.loadingText}>
                  {editingCombinationId
                    ? 'Updating combination...'
                    : 'Creating combination...'}
                </Text>
              </View>
            )}
            <ScrollView
              contentContainerStyle={styles.modalScrollContainer}
              keyboardShouldPersistTaps="always">
              <Text style={styles.modalTitle}>
                {editingCombinationId
                  ? 'Edit Combination'
                  : 'Create Combination'}
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter a name for this combination"
                value={nameValue}
                onChangeText={handleNameChange}
                returnKeyType="done"
              />
              <View style={styles.serviceControls}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    !serviceRunning ? styles.startButton : styles.runningButton,
                  ]}
                  onPress={() => toggleService(true)}
                  disabled={serviceRunning}>
                  <Text style={styles.buttonText}>
                    {serviceRunning ? '✓ Recording...' : 'Start Recording'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.stopButton,
                    !serviceRunning && styles.disabledButton,
                  ]}
                  onPress={() => toggleService(false)}
                  disabled={!serviceRunning}>
                  <Text style={styles.buttonText}>Stop Recording</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sequencePreview}>
                <View style={styles.sequenceHeader}>
                  <Text style={styles.previewTitle}>
                    Current Sequence: {buttonSequence.length} button
                    {buttonSequence.length > 1 ? 's' : ''}
                  </Text>
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearSequence}>
                    <Text style={styles.clearButtonText}>Clear</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.sequenceScrollView}>
                  <View style={styles.previewButtons}>
                    {buttonSequence.map((button: string, index: number) => (
                      <View
                        key={`${index}-${button}`}
                        style={[
                          styles.previewButton,
                          button === 'volumeUp'
                            ? styles.volumeUpButton
                            : styles.volumeDownButton,
                          index === buttonSequence.length - 1 &&
                            styles.lastButtonAdded,
                        ]}>
                        <Text style={styles.previewButtonText}>
                          {button === 'volumeUp' ? '▲' : '▼'}
                        </Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
              <Text style={styles.modalSubtitle}>Message to Send:</Text>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Enter message to send to your friend(s)"
                  value={messageValue}
                  onChangeText={handleMessageChange}
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              <Text style={styles.modalSubtitle}>Select Target Friends:</Text>
              {friends?.length > 0 ? (
                <View style={styles.friendsList}>
                  {friends.map(friend => (
                    <TouchableOpacity
                      key={friend._id}
                      style={styles.friendCheckbox}
                      onPress={() => toggleFriendSelect(friend._id)}>
                      <View
                        style={[
                          styles.checkbox,
                          selectedFriends.includes(friend._id) &&
                            styles.checkboxSelected,
                        ]}>
                        {selectedFriends.includes(friend._id) && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                      <Text style={styles.friendName}>{friend.username}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.noFriendsContainer}>
                  <Text style={styles.noFriendsText}>
                    You currently have no friends added.
                  </Text>
                </View>
              )}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={handleCloseModal}>
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalSaveButton,
                    saveButtonDisabled && styles.disabledButton,
                  ]}
                  onPress={handleSaveButtonPress}
                  disabled={saveButtonDisabled}>
                  <Text style={styles.modalSaveButtonText}>
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#5a67d8" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Personal Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={styles.createCombinationButton}
          onPress={() => openCombinationModal()}>
          <Text style={styles.createCombinationButtonText}>
            Create Combination
          </Text>
        </TouchableOpacity>
        {friends?.length > 0 && (
          <View style={styles.savedSequencesCard}>
            <Text style={styles.cardTitle}>Saved Combinations</Text>
            {isSubmitting ? (
              <ActivityIndicator size="large" color="#5a67d8" />
            ) : combinations.length > 0 ? (
              <FlatList
                data={combinations}
                renderItem={renderCombinationItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No saved combinations yet. Create your first combination to
                  send alerts to friends!
                </Text>
              </View>
            )}
          </View>
        )}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How Combinations Work</Text>
          <Text style={styles.infoText}>
            1. Create a combination by clicking "Create Combination"
          </Text>
          <Text style={styles.infoText}>
            2. Press volume buttons to record your unique combination
          </Text>
          <Text style={styles.infoText}>
            3. Add a message and select friends to notify
          </Text>
          <Text style={styles.infoText}>
            4. When you press the same volume button sequence again, your
            friends will receive your message!
          </Text>
        </View>
      </ScrollView>
      <Modal
        visible={saveModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSaveModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Sequence</Text>
            <TextInput
              style={[styles.modalInput, styles.messageInput]}
              placeholder="Enter a name for this sequence"
              value={sequenceName}
              onChangeText={setSequenceName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setSaveModalVisible(false)}>
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveSequence}>
                <Text style={styles.modalSaveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <CreateCombinationModal />
      <BottomNavigation />
    </SafeAreaView>
  );
};

export default PersonalProfile;
