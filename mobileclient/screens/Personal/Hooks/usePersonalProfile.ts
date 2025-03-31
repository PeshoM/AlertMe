import {useEffect, useState, useRef, useContext} from 'react';
import {NativeModules, NativeEventEmitter, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {UserContext} from '../../../Context';
import {
  SERVER_URL,
  GET_COMBINATIONS,
  ADD_COMBINATION,
  DELETE_COMBINATION,
  UPDATE_COMBINATION,
} from '@env';

export interface SavedSequence {
  id: string;
  name: string;
  sequence: string[];
  createdAt: number;
}

export interface Combination {
  id: string;
  name: string;
  target: string;
  sequence: string[];
  createdAt: number;
  message?: string;
}

const generateUniqueId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomPart}`;
};

const getFormattedApiUrl = (basePath: string, endpoint: string): string => {
  if (!endpoint) {
    return basePath;
  }

  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  if (!basePath) {
    if (endpoint.startsWith('/')) {
      return endpoint;
    }
    return `/${endpoint}`;
  }

  let formattedUrl: string;

  if (basePath.endsWith('/') && endpoint.startsWith('/'))
    formattedUrl = `${basePath.slice(0, -1)}${endpoint}`;
  else if (!basePath.endsWith('/') && !endpoint.startsWith('/'))
    formattedUrl = `${basePath}/${endpoint}`;
  else formattedUrl = `${basePath}${endpoint}`;

  return formattedUrl;
};

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const usePersonalProfile = () => {
  const {authenticatedUser, friends} = useContext(UserContext);

  const [serviceRunning, setServiceRunning] = useState<boolean>(false);
  const [buttonSequence, setButtonSequence] = useState<string[]>([]);

  const [savedSequences, setSavedSequences] = useState<SavedSequence[]>([]);
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const nameInputRef = useRef<string>('');
  const messageInputRef = useRef<string>('');

  const {NativeCaller} = NativeModules;

  useEffect(() => {
    if (authenticatedUser?._id) {
      loadSavedSequences();
      loadCombinations();
    }

    return () => {
      if (Platform.OS === 'android') {
        NativeCaller.stopService();
        setServiceRunning(false);
      }
    };
  }, [authenticatedUser?._id]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const eventEmitter = new NativeEventEmitter(NativeModules.NativeCaller);
    eventEmitter.removeAllListeners('VolumeEvent');

    const subscription = eventEmitter.addListener('VolumeEvent', event => {
      if (!event?.action || event.action === 'serviceStarted') return;

      setButtonSequence(prev => {
        const newSequence = [...prev, event.action];

        checkForMatchingCombinations(newSequence);
        return newSequence.slice(-10);
      });

      if (NativeModules.Vibration) {
        NativeModules.Vibration.vibrate(50);
      }
    });

    return () => {
      subscription.remove();
      if (serviceRunning && Platform.OS === 'android') {
        NativeCaller.stopService();
        setServiceRunning(false);
      }
    };
  }, [combinations, serviceRunning]);

  const toggleService = (start = true) => {
    if (Platform.OS === 'android') {
      if (start) {
        NativeCaller.startService();
        setServiceRunning(true);
      } else {
        NativeCaller.stopService();
        setServiceRunning(false);
      }
    }
  };

  const getUserStorageKey = () => `@sequences_${authenticatedUser?._id}`;

  const loadSavedSequences = async () => {
    try {
      const sequencesJson = await AsyncStorage.getItem(getUserStorageKey());
      setSavedSequences(sequencesJson ? JSON.parse(sequencesJson) : []);
    } catch (error) {}
  };

  const saveSequencesToStorage = async (sequences: SavedSequence[]) => {
    try {
      await AsyncStorage.setItem(
        getUserStorageKey(),
        JSON.stringify(sequences),
      );
    } catch (error) {}
  };

  const loadCombinations = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token || !authenticatedUser?._id) return;

      const formattedUrl = getFormattedApiUrl(SERVER_URL, GET_COMBINATIONS);

      const response = await fetch(formattedUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({userId: authenticatedUser._id}),
      });

      if (!response.ok) {
        throw new Error('Failed to load combinations');
      }

      const data = await response.json();
      if (data.combinations) {
        const processedCombinations = data.combinations.map(
          (combo: Combination) => ({
            ...combo,
            message: combo.message || '',
          }),
        );

        setCombinations(processedCombinations);
      } else {
        setCombinations([]);
      }
    } catch (error) {}
  };

  const saveCombinationToServer = async (
    combination: Combination,
    isUpdate = false,
  ) => {
    try {
      const operationType = isUpdate
        ? 'UPDATE'
        : combination.id.includes('-')
        ? 'CREATE'
        : 'RECREATE';

      const token = await AsyncStorage.getItem('auth_token');
      if (!token || !authenticatedUser?._id) {
        return false;
      }

      let urlPath = isUpdate ? UPDATE_COMBINATION : ADD_COMBINATION;

      let url = getFormattedApiUrl(SERVER_URL, urlPath);

      const combinationToSave = {
        ...combination,
        message: combination.message || '',
      };

      const payload = {
        userId: authenticatedUser._id,
        id: combination.id,
        combinationId: combination.id,
        name: combination.name,
        target: combination.target,
        sequence: combination.sequence,
        message: combination.message || '',
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let responseText = '';
      try {
        responseText = await response.text();

        if (responseText) {
          try {
            const responseData = JSON.parse(responseText);
          } catch (e) {}
        }
      } catch (error) {}

      if (!response.ok) {
        throw new Error(
          `Failed to ${
            isUpdate ? 'update' : 'save'
          } combination - Server returned ${response.status}`,
        );
      }

      await loadCombinations();

      return true;
    } catch (error) {
      return false;
    }
  };

  const deleteCombination = async (combinationId: string) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token || !authenticatedUser?._id) return false;

      const formattedUrl = getFormattedApiUrl(SERVER_URL, DELETE_COMBINATION);

      const response = await fetch(formattedUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: authenticatedUser._id,
          combinationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete combination');
      }

      loadCombinations();
      return true;
    } catch (error) {
      return false;
    }
  };

  const loadSequence = (sequence: string[]) => {
    setButtonSequence(sequence);
  };

  const clearSequence = () => {
    setButtonSequence([]);
  };

  const checkForMatchingCombinations = (sequence: string[]) => {
    if (sequence.length < 3) return;

    const recentSequence = sequence.slice(-10);

    combinations.forEach(combination => {
      const combinationSequence = combination.sequence;

      const isMatch =
        combinationSequence.length <= recentSequence.length &&
        JSON.stringify(recentSequence.slice(-combinationSequence.length)) ===
          JSON.stringify(combinationSequence);

      if (isMatch) {
      }
    });
  };

  const tryMultipleEndpoints = async (
    baseUrl: string,
    payload: any,
    token: string,
  ): Promise<{success: boolean; message: string; endpoint?: string}> => {
    const possibleEndpointPaths = [
      '/combinations/update',
      '/api/combinations/update',
      '/combination/update',
      '/api/combination/update',
      '/updateCombination',
      '/api/updateCombination',
      '/update-combination',
    ];

    try {
      return await directUpdateCombination(payload, token);
    } catch (directError) {}

    for (const endpointPath of possibleEndpointPaths) {
      try {
        const fullUrl = baseUrl.endsWith('/')
          ? `${baseUrl.slice(0, -1)}${endpointPath}`
          : `${baseUrl}${endpointPath}`;

        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const responseText = await response.text();

        if (response.status >= 200 && response.status < 300) {
          await loadCombinations();

          return {
            success: true,
            message: 'Combination updated successfully',
            endpoint: endpointPath,
          };
        }
      } catch (error) {}
    }

    return {
      success: false,
      message: 'API endpoints not available - using local-first approach',
    };
  };

  const directUpdateCombination = async (
    payload: any,
    token: string,
  ): Promise<{success: boolean; message: string; endpoint?: string}> => {
    if (!authenticatedUser?._id) {
      throw new Error('No authenticated user');
    }

    const {id, name, target, sequence, message} = payload;

    if (!id) {
      throw new Error('No combination ID provided');
    }

    const combinationsUrl = getFormattedApiUrl(
      SERVER_URL,
      '/users/combinations',
    );

    const directPayload = {
      userId: authenticatedUser._id,
      combinationId: id,
      update: {
        name,
        target,
        sequence,
        message: message || '',
      },
      operation: 'update',
    };

    const response = await fetch(combinationsUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(directPayload),
    });

    let responseText = '';
    try {
      responseText = await response.text();

      if (response.status >= 200 && response.status < 300) {
        await loadCombinations();

        return {
          success: true,
          message: 'Combination updated successfully',
          endpoint: '/users/combinations (PUT)',
        };
      } else {
      }
    } catch (error) {}

    throw new Error('Standard RESTful update not supported');
  };

  const updateByDeleteAndCreate = async (
    updatedCombination: Combination,
  ): Promise<boolean> => {
    const minLoadingTime = delay(800);

    const deleteResult = await deleteCombination(updatedCombination.id);

    if (!deleteResult) {
      await minLoadingTime;
      return false;
    }

    const result = await saveCombinationToServer(updatedCombination, false);

    await minLoadingTime;
    return result;
  };

  const saveCombination = async (
    buttonSeq: string[],
    selectedTargets: string[],
    existingCombinationId: string | null = null,
  ): Promise<{success: boolean; message: string}> => {
    try {
      setIsSubmitting(true);

      if (buttonSeq.length === 0) {
        return {success: false, message: 'Button sequence cannot be empty'};
      }

      if (selectedTargets.length === 0) {
        return {success: false, message: 'You must select at least one friend'};
      }

      if (!nameInputRef.current || nameInputRef.current.trim() === '') {
        return {success: false, message: 'Combination name cannot be empty'};
      }

      const combinationName = nameInputRef.current;
      const messageText = messageInputRef.current || '';

      const combinationExists = combinations.find(
        c =>
          c.id !== existingCombinationId &&
          JSON.stringify(c.sequence) === JSON.stringify(buttonSeq),
      );

      if (combinationExists) {
        return {
          success: false,
          message:
            'A combination with this button sequence already exists. Please use a different sequence.',
        };
      }

      if (existingCombinationId) {
        const existingCombination = combinations.find(
          c => c.id === existingCombinationId,
        );

        if (!existingCombination) {
          return {
            success: false,
            message:
              'Combination not found. Please refresh the app and try again.',
          };
        }

        const updatedCombination: Combination = {
          id: existingCombination.id,
          name: combinationName,
          sequence: buttonSeq,
          target: selectedTargets[0],
          message: messageText || '',
          createdAt: existingCombination.createdAt,
        };

        try {
          const result = await updateByDeleteAndCreate(updatedCombination);

          await delay(500);

          if (result) {
            await loadCombinations();

            clearSequence();
            nameInputRef.current = '';
            messageInputRef.current = '';

            return {
              success: true,
              message: 'Combination updated successfully',
            };
          } else {
            const updatedCombinations = combinations.map(c =>
              c.id === existingCombinationId ? updatedCombination : c,
            );
            setCombinations(updatedCombinations);

            clearSequence();
            nameInputRef.current = '';
            messageInputRef.current = '';

            return {
              success: true,
              message:
                'Combination updated in app only. Please check your connection.',
            };
          }
        } catch (error) {
          await delay(500);

          const updatedCombinations = combinations.map(c =>
            c.id === existingCombinationId ? updatedCombination : c,
          );
          setCombinations(updatedCombinations);

          clearSequence();
          nameInputRef.current = '';
          messageInputRef.current = '';

          return {
            success: true,
            message:
              'Combination updated with errors. Some changes may not persist.',
          };
        }
      } else {
        const newCombination: Combination = {
          id: generateUniqueId(),
          name: combinationName,
          sequence: buttonSeq,
          message: messageText,
          target: selectedTargets[0],
          createdAt: Date.now(),
        };

        const result = await saveCombinationToServer(newCombination, false);
        if (!result) {
          return {
            success: false,
            message: 'Failed to save combination. Please try again.',
          };
        }
      }

      clearSequence();
      nameInputRef.current = '';
      messageInputRef.current = '';

      await delay(500);

      return {success: true, message: 'Combination saved successfully'};
    } catch (error) {
      return {
        success: false,
        message: `Error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      };
    } finally {
      try {
        await delay(300);
      } catch (e) {}
      setIsSubmitting(false);
    }
  };

  const saveSequence = async (name: string, sequence: string[]) => {
    if (!name.trim()) {
      return {success: false, message: 'Please enter a name for this sequence'};
    }

    try {
      const newSequence: SavedSequence = {
        id: Date.now().toString(),
        name: name.trim(),
        sequence: [...sequence],
        createdAt: Date.now(),
      };

      const updatedSequences = [...savedSequences, newSequence];
      setSavedSequences(updatedSequences);
      await saveSequencesToStorage(updatedSequences);

      return {success: true, message: 'Sequence saved successfully'};
    } catch (error) {
      return {success: false, message: 'Error saving sequence'};
    }
  };

  const deleteSequence = async (id: string) => {
    try {
      const updatedSequences = savedSequences.filter(seq => seq.id !== id);
      setSavedSequences(updatedSequences);
      await saveSequencesToStorage(updatedSequences);
      return {success: true};
    } catch (error) {
      return {success: false, message: 'Error deleting sequence'};
    }
  };

  const updateWithBasicFallback = async (
    existingCombinationId: string,
    buttonSeq: string[],
    combinationName: string,
    messageText: string,
    targetFriendId: string,
  ) => {
    if (!authenticatedUser?._id) {
      return {
        success: false,
        message: 'No authenticated user found',
      };
    }

    try {
      const updatedCombinations = combinations.map(c =>
        c.id === existingCombinationId
          ? {
              ...c,
              name: combinationName,
              sequence: buttonSeq,
              target: targetFriendId,
              message: messageText || '',
            }
          : c,
      );

      setCombinations(updatedCombinations);

      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        return {
          success: true,
          message: 'Combination updated successfully (offline mode)',
        };
      }

      try {
        const simplestUrl = getFormattedApiUrl(
          SERVER_URL,
          '/combinations/replace',
        );

        const response = await fetch(simplestUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: authenticatedUser._id,
            combinations: updatedCombinations,
          }),
        });

        const responseText = await response.text();

        if (response.ok) {
          return {
            success: true,
            message: 'Combination updated successfully (synced with server)',
          };
        }
      } catch (error) {}

      return {
        success: true,
        message: 'Combination updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message:
          'Update failed: ' +
          (error instanceof Error ? error.message : String(error)),
      };
    }
  };

  return {
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
  };
};
