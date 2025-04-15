import {useState, useContext, useCallback} from 'react';
import {
  GET_FRIENDS_DATA,
  SERVER_URL,
  HANDLE_SEARCH,
  SEND_FRIEND_REQUEST,
} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {UserContext} from '../../../Context';
import {IUser} from '../../../interfaces/user.interface';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {AppParamList} from '../../../types/app.param.list';

const useFriends = () => {
  const {
    authenticatedUser,
    setAuthenticatedUser,
    setReceivedRequests,
    sentRequests,
    setSentRequests,
    setFriends,
  } = useContext(UserContext);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [searchResults, setSearchResults] = useState<IUser[]>([]);
  const [isHovered, setIsHovered] = useState<string>('');
  const navigation = useNavigation<NavigationProp<AppParamList>>();

  const toggleModal = (mode: boolean) => {
    setIsModalVisible(mode);
  };

  const handleChange = (text: string) => {
    setInput(text);
    handleSearch(text);
  };

  const handleSearch = async (text: string) => {
    const handleSearchUrl: string = `${SERVER_URL}${HANDLE_SEARCH}`;
    const response = await fetch(handleSearchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
      }),
    }).then(res => res.json());
    setSearchResults(response.results);
  };

  const handleFetchFriends = async () => {
    try {
      const fetchFriendsUrl: string = `${SERVER_URL}${GET_FRIENDS_DATA}`;
      const response = await fetch(fetchFriendsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: authenticatedUser._id,
        }),
      }).then(res => res.json());

      if (response.friendsList) {
        setFriends(response.friendsList);

        await AsyncStorage.setItem(
          'friends_data',
          JSON.stringify(response.friendsList),
        );
      }

      if (response.receivedFriendRequests) {
        setReceivedRequests(response.receivedFriendRequests);
      }

      if (response.sentFriendRequests) {
        setSentRequests(response.sentFriendRequests);
      }
    } catch (error) {
      console.error('Error in handleFetchFriends:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      handleSearch('');
      handleFetchFriends();
      return () => {};
    }, []),
  );

  const handleResultLongPress = (val: string) => setIsHovered(val);

  const handleSendFriendRequest = async (addedUser: IUser) => {
    const sendFriendRequestUrl: string = `${SERVER_URL}${SEND_FRIEND_REQUEST}`;
    const response = await fetch(sendFriendRequestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currUserId: authenticatedUser._id,
        userToRequestId: addedUser._id,
      }),
    }).then(res => res.json());

    setAuthenticatedUser((user: IUser) => {
      let {sentFriendRequests} = user;

      return {
        ...user,
        sentFriendRequests: [...sentFriendRequests, addedUser._id],
      };
    });
    setSentRequests([...sentRequests, addedUser]);
  };

  const handleNavigateToProfile = (openedUserId: string) => {
    authenticatedUser._id !== openedUserId &&
      navigation.navigate('Profile', {openedUserId});
  };

  return {
    isModalVisible,
    searchResults,
    isHovered,
    input,
    toggleModal,
    handleChange,
    handleFetchFriends,
    handleResultLongPress,
    handleSendFriendRequest,
    handleNavigateToProfile,
  };
};

export {useFriends};
