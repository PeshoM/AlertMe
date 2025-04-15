import {useEffect, useState, useRef, useContext} from 'react';
import {NativeModules, NativeEventEmitter, Platform, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {UserContext} from '../../../Context';
import {
  SERVER_URL,
  GET_COMBINATIONS,
  ADD_COMBINATION,
  DELETE_COMBINATION,
  UPDATE_COMBINATION,
  TRIGGER_COMBINATION,
  GET_FRIENDS_DATA,
} from '@env';
import {
  SavedSequence,
  Combination,
} from '../../../interfaces/combination.interface';
import {IUser} from '../../../interfaces/user.interface';

const generateUniqueId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;

const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

const usePersonalProfile = () => {
  const {
    authenticatedUser,
    combinations,
    setCombinations,
    combinationsRef,
    friends,
    setFriends,
  } = useContext(UserContext);
  const [serviceRunning, setServiceRunning] = useState(false);
  const [buttonSequence, setButtonSequence] = useState<string[]>([]);
  const [savedSequences, setSavedSequences] = useState<SavedSequence[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preserveSequence, setPreserveSequence] = useState(false);
  const [combinationModalVisible, setCombinationModalVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [sequenceName, setSequenceName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [editingCombinationId, setEditingCombinationId] = useState<
    string | null
  >(null);

  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const eventEmitterRef = useRef<NativeEventEmitter | null>(null);
  const eventSubscriptionRef = useRef<{remove: () => void} | null>(null);
  const nameInputRef = useRef('');
  const messageInputRef = useRef('');

  const {NativeCaller} = NativeModules;

  const storageKeys = {
    sequences: `@sequences_${authenticatedUser?._id}`,
    combinations: `@combinations_${authenticatedUser?._id}`,
  };

  const loadFriendsData = async () => {
    try {

      const friendsData = await AsyncStorage.getItem('friends_data');
      if (friendsData) {
        const parsedFriends = JSON.parse(friendsData);
        if (Array.isArray(parsedFriends) && parsedFriends.length > 0) {
          setFriends(parsedFriends);
        }
      }

      const token = await AsyncStorage.getItem('auth_token');
      if (!token || !authenticatedUser?._id) {
        return;
      }

      const response = await fetch(`${SERVER_URL}${GET_FRIENDS_DATA}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: authenticatedUser._id,
        }),
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (data.friends && Array.isArray(data.friends)) {

        const validFriends = data.friends.filter(
          (friend: any) => friend && friend._id && friend.username,
        );

        if (validFriends.length > 0) {
          setFriends(validFriends);
          await AsyncStorage.setItem(
            'friends_data',
            JSON.stringify(validFriends),
          );
        }
      } else if (authenticatedUser?.friends?.length > 0) {
        
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const openCombinationModal = (combinationToEdit?: Combination) => {
    if (combinationToEdit || !combinationModalVisible) {
      if (combinationToEdit) {
        nameInputRef.current = combinationToEdit.name;
        messageInputRef.current = combinationToEdit.message || '';
        setSelectedFriends([combinationToEdit.target]);
        loadSequence(combinationToEdit.sequence);
        setEditingCombinationId(combinationToEdit.id);
      } else {
        nameInputRef.current = '';
        messageInputRef.current = '';
        setSelectedFriends([]);
        setEditingCombinationId(null);
        clearSequence();
      }
    }
    setCombinationModalVisible(true);
  };

  const closeModal = () => {
    setCombinationModalVisible(false);
    setEditingCombinationId(null);
  };

  const openSaveModal = () => {
    if (buttonSequence.length === 0) return;
    setSequenceName('');
    setSaveModalVisible(true);
  };

  const handleSaveCombination = async () => {
    if (buttonSequence.length === 0) {
      Alert.alert(
        'Error',
        'Button sequence cannot be empty. Please record a sequence first.',
      );
      return;
    }

    if (buttonSequence.length < 3) {
      Alert.alert(
        'Error',
        'Combination must have at least 3 button presses for security.',
      );
      return;
    }

    if (selectedFriends.length === 0) {
      Alert.alert(
        'Error',
        'Please select at least one friend to send the alert to.',
      );
      return;
    }

    const result = await saveCombination(
      buttonSequence,
      selectedFriends,
      editingCombinationId,
    );

    if (result.success) {
      setCombinationModalVisible(false);
      if (!editingCombinationId) {
        clearSequence();
      }
      setSelectedFriends([]);
      setEditingCombinationId(null);
      Alert.alert('Success', result.message);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleSaveSequence = async () => {
    const result = await saveSequence(sequenceName, buttonSequence);
    if (result.success) setSaveModalVisible(false);
  };

  const showDeleteConfirmation = (
    id: string,
    type: 'sequence' | 'combination',
  ) => {
    Alert.alert(
      `Delete ${type === 'sequence' ? 'Sequence' : 'Combination'}`,
      `Are you sure you want to delete this ${type}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (type === 'sequence') {
              deleteSequence(id).then(result => {
                if (result.success) {
                  Alert.alert('Success', 'Sequence deleted successfully');
                }
              });
            } else {
              deleteCombination(id).then(success => {
                if (success) {
                  Alert.alert('Success', 'Combination deleted successfully');
                } else {
                  Alert.alert(
                    'Error',
                    'Failed to delete combination. Please try again.',
                  );
                }
              });
            }
          },
        },
      ],
    );
  };

  const setupVolumeEventListener = () => {
    if (Platform.OS !== 'android') return;

    try {
      const volumeModule = NativeModules.VolumeServiceModule;
      if (!volumeModule) return null;

      if (eventEmitterRef.current) {
        eventEmitterRef.current.removeAllListeners('VolumeEvent');
      }
      if (eventSubscriptionRef.current) {
        eventSubscriptionRef.current.remove();
        eventSubscriptionRef.current = null;
      }

      eventEmitterRef.current = new NativeEventEmitter(volumeModule);

      const subscription = eventEmitterRef.current.addListener(
        'VolumeEvent',
        event => {
          if (!event?.action || event.action === 'serviceStarted') return;

          try {
            if (NativeModules.Vibration) NativeModules.Vibration.vibrate(50);
            resetSequenceTimeout();

            setButtonSequence(prev => {
              const newSequence = [...prev, event.action];
              
              checkForMatchingCombinations(newSequence).catch(() => {});
              return newSequence;
            });
          } catch (error) {
          }
        },
      );

      eventSubscriptionRef.current = subscription;
      return subscription;
    } catch (error) {
      return null;
    }
  };

  const resetSequenceTimeout = () => {
    if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
    if (preserveSequence) return;

    sequenceTimeoutRef.current = setTimeout(() => {
      if (!preserveSequence) setButtonSequence([]);
      sequenceTimeoutRef.current = null;
    }, 3000);
  };

  const clearSequence = () => {
    setButtonSequence([]);
    setPreserveSequence(false);
    if (sequenceTimeoutRef.current) {
      clearTimeout(sequenceTimeoutRef.current);
      sequenceTimeoutRef.current = null;
    }
  };

  const loadSequence = (sequence: string[]) => setButtonSequence(sequence);

  const loadSavedSequences = async () => {
    try {
      const sequencesJson = await AsyncStorage.getItem(
        storageKeys.sequences,
      ).catch(() => null);
      if (sequencesJson) setSavedSequences(JSON.parse(sequencesJson));
    } catch (error) {
    }
  };

  const saveSequencesToStorage = async (sequences: SavedSequence[]) => {
    try {
      await AsyncStorage.setItem(
        storageKeys.sequences,
        JSON.stringify(sequences),
      );
    } catch (error) {
    }
  };

  const apiRequest = async (endpoint: string, data: any, method = 'POST') => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token || !authenticatedUser?._id) return null;

      let url = endpoint;
      if (!endpoint.startsWith('http')) {
        url = `${SERVER_URL}${endpoint}`;
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.ok ? response : null;
    } catch (error) {
      return null;
    }
  };

  const loadCombinations = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token || !authenticatedUser?._id) return;

      const localData = await AsyncStorage.getItem(
        storageKeys.combinations,
      ).catch(() => null);
      if (localData) {
        const parsed = JSON.parse(localData);
        setCombinations(parsed);
        if (combinationsRef?.current) combinationsRef.current = parsed;
      }

      const response = await fetch(`${SERVER_URL}${GET_COMBINATIONS}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({userId: authenticatedUser._id}),
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.combinations) {
        const processed = data.combinations.map((c: Combination) => ({
          ...c,
          message: c.message || '',
        }));

        setCombinations(processed);
        if (combinationsRef?.current) combinationsRef.current = processed;
        await AsyncStorage.setItem(
          storageKeys.combinations,
          JSON.stringify(processed),
        );
      } else {
        setCombinations([]);
        if (combinationsRef?.current) combinationsRef.current = [];
      }
    } catch (error) {
    }
  };

  const checkForMatchingCombinations = async (sequence: string[]) => {
    try {
      if (sequence.length < 3) return;

      const availableCombinations = combinationsRef?.current || [];
      for (const combination of availableCombinations) {
        if (combination.sequence.length > sequence.length) continue;

        const endOfSequence = sequence.slice(-combination.sequence.length);
        const isMatch = combination.sequence.every(
          (event: string, index: number) => event === endOfSequence[index],
        );

        if (isMatch) {
          clearSequence();
          await triggerCombinationOnServer(combination.id);
          break;
        }
      }
    } catch (error) {
    }
  };

  const toggleService = (start = true) => {
    if (Platform.OS !== 'android') return;

    try {
      if (start) {
        NativeCaller.startService();
        setServiceRunning(true);
        setPreserveSequence(false);
        if (!preserveSequence) clearSequence();

        setupVolumeEventListener();
      } else {
        setPreserveSequence(true);
        NativeCaller.stopService();
        setServiceRunning(false);
        if (sequenceTimeoutRef.current) {
          clearTimeout(sequenceTimeoutRef.current);
          sequenceTimeoutRef.current = null;
        }

        if (eventSubscriptionRef.current) {
          eventSubscriptionRef.current.remove();
          eventSubscriptionRef.current = null;
        }
        if (eventEmitterRef.current) {
          eventEmitterRef.current.removeAllListeners('VolumeEvent');
        }
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    return () => {
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
        sequenceTimeoutRef.current = null;
      }

      if (eventSubscriptionRef.current) {
        eventSubscriptionRef.current.remove();
        eventSubscriptionRef.current = null;
      }

      if (eventEmitterRef.current) {
        eventEmitterRef.current.removeAllListeners('VolumeEvent');
        eventEmitterRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (authenticatedUser?._id) {
      loadSavedSequences();
      loadCombinations();
      loadFriendsData();
    }

    return () => {
      if (Platform.OS === 'android') {
        try {
          NativeCaller.stopService();
          setServiceRunning(false);
        } catch (error) {
        }
      }
    };
  }, [authenticatedUser?._id]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    try {
      if (!serviceRunning) toggleService(true);
      const subscription = setupVolumeEventListener();

      return () => {
        if (subscription) {
          subscription.remove();
        }
      };
    } catch (error) {
    }
  }, []);

  useEffect(() => {
    if (!serviceRunning) {
      setPreserveSequence(true);
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
        sequenceTimeoutRef.current = null;
      }
    }
  }, [serviceRunning]);

  useEffect(() => {
    if (!isSubmitting && preserveSequence && buttonSequence.length === 0) {
      setPreserveSequence(false);
    }
  }, [isSubmitting, preserveSequence, buttonSequence]);

  const saveCombination = async (
    buttonSeq: string[],
    selectedTargets: string[],
    existingCombinationId: string | null = null,
  ): Promise<{success: boolean; message: string}> => {
    setIsSubmitting(true);

    if (!buttonSeq.length)
      return {success: false, message: 'Button sequence cannot be empty'};
    if (buttonSeq.length < 3)
      return {
        success: false,
        message: 'Combination must have at least 3 button presses',
      };
    if (!selectedTargets.length)
      return {success: false, message: 'You must select at least one friend'};
    if (!nameInputRef.current?.trim())
      return {success: false, message: 'Combination name cannot be empty'};

    const name = nameInputRef.current;
    const message = messageInputRef.current || '';

    const isDuplicate = combinations.some(
      c =>
        c.id !== existingCombinationId &&
        JSON.stringify(c.sequence) === JSON.stringify(buttonSeq),
    );

    if (isDuplicate) {
      setIsSubmitting(false);
      return {
        success: false,
        message:
          'A combination with this sequence already exists. Please use a different sequence.',
      };
    }

    try {
      if (existingCombinationId) {
        const existing = combinations.find(c => c.id === existingCombinationId);
        if (!existing) {
          setIsSubmitting(false);
          return {
            success: false,
            message:
              'Combination not found. Please refresh the app and try again.',
          };
        }

        const updated = {
          ...existing,
          name,
          sequence: buttonSeq,
          target: selectedTargets[0],
          message,
        };

        const result = await updateByDeleteAndCreate(updated);
        nameInputRef.current = '';
        messageInputRef.current = '';

        if (result) {
          await loadCombinations();
          setIsSubmitting(false);
          if (Platform.OS === 'android') {
            toggleService(true);
          }
          return {success: true, message: 'Combination updated successfully'};
        } else {
          setCombinations(
            combinations.map(c =>
              c.id === existingCombinationId ? updated : c,
            ),
          );
          setIsSubmitting(false);
          if (Platform.OS === 'android') {
            toggleService(true);
          }
          return {
            success: true,
            message:
              'Combination updated in app only. Please check your connection.',
          };
        }
      } else {
        const newCombination = {
          id: generateUniqueId(),
          name,
          sequence: buttonSeq,
          message,
          target: selectedTargets[0],
          createdAt: Date.now(),
        };

        const result = await saveCombinationToServer(newCombination, false);
        clearSequence();
        nameInputRef.current = '';
        messageInputRef.current = '';

        if (!result) {
          setIsSubmitting(false);
          return {
            success: false,
            message: 'Failed to save combination. Please try again.',
          };
        }
      }

      await delay(500);
      setPreserveSequence(false);
      setIsSubmitting(false);
      if (Platform.OS === 'android') {
        toggleService(true);
      }
      return {success: true, message: 'Combination saved successfully'};
    } catch (error) {
      setIsSubmitting(false);
      return {
        success: false,
        message: `Error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      };
    }
  };

  const saveSequence = async (name: string, sequence: string[]) => {
    if (!name.trim())
      return {success: false, message: 'Please enter a name for this sequence'};

    const newSequence = {
      id: Date.now().toString(),
      name: name.trim(),
      sequence: [...sequence],
      createdAt: Date.now(),
    };

    const updated = [...savedSequences, newSequence];
    setSavedSequences(updated);
    await saveSequencesToStorage(updated);
    return {success: true, message: 'Sequence saved successfully'};
  };

  const deleteSequence = async (id: string) => {
    const updated = savedSequences.filter(seq => seq.id !== id);
    setSavedSequences(updated);
    await saveSequencesToStorage(updated);
    return {success: true};
  };

  const saveCombinationToServer = async (
    combination: Combination,
    isUpdate = false,
  ) => {
    const endpoint = isUpdate ? UPDATE_COMBINATION : ADD_COMBINATION;
    const payload = {
      userId: authenticatedUser?._id,
      id: combination.id,
      combinationId: combination.id,
      name: combination.name,
      target: combination.target,
      sequence: combination.sequence,
      message: combination.message || '',
    };

    const response = await apiRequest(endpoint, payload);
    if (response) {
      await loadCombinations();
      return true;
    }
    return false;
  };

  const deleteCombination = async (combinationId: string) => {
    const response = await apiRequest(DELETE_COMBINATION, {
      userId: authenticatedUser?._id,
      combinationId,
    });

    if (response) {
      await loadCombinations();

      if (Platform.OS === 'android') {
        toggleService(true);
      }

      return true;
    }
    return false;
  };

  const updateByDeleteAndCreate = async (
    combination: Combination,
  ): Promise<boolean> => {
    const deleteResult = await deleteCombination(combination.id);
    if (!deleteResult) {
      await delay(800);
      return false;
    }
    const result = await saveCombinationToServer(combination, false);
    await delay(800);
    return result;
  };

  const triggerCombinationOnServer = async (combinationId: string) => {
    const response = await apiRequest(TRIGGER_COMBINATION, {
      userId: authenticatedUser?._id,
      combinationId,
    });
    return !!response;
  };

  return {
    serviceRunning,
    buttonSequence,
    combinations,
    isSubmitting,
    combinationModalVisible,
    saveModalVisible,
    setSaveModalVisible,
    sequenceName,
    setSequenceName,
    selectedFriends,
    setSelectedFriends,
    editingCombinationId,
    nameInputRef,
    messageInputRef,
    openCombinationModal,
    closeModal,
    openSaveModal,
    handleSaveCombination,
    handleSaveSequence,
    showDeleteConfirmation,
    toggleService,
    clearSequence,
    friends,
  };
};

export {usePersonalProfile};
