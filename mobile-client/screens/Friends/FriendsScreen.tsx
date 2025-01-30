import React, { useEffect, useState, useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  Modal,
  TextInput,
} from "react-native";
import { FriendsScreenProps } from "../../types/screen.props";
import { styles } from "../../styles/friends.styles";
import {
  GET_FRIENDS_DATA,
  SERVER_URL,
  HANDLE_SEARCH,
  SEND_FRIEND_REQUEST,
} from "@env";
import { UserContext } from "../../Context";
import { IUser } from "../../interfaces/user.interface";
import BottomNavigation from "../../components/BottomNavigation";

const FriendsScreen: React.FC<FriendsScreenProps> = ({ navigation }) => {
  const { authenticatedUser } = useContext(UserContext);
  const [friends, setFriends] = useState<IUser[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<IUser[]>([]);
  const [isHovered, setIsHovered] = useState<string>("");

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleChange = (text: string) => {
    console.log(text.length);
    setInput(text); // Update the input state
    handleSearch(text); // Call the function on input change
  };

  // Example function that you want to call whenever input changes
  const handleSearch = async (text: string) => {
    const handleSearchUrl: string = `${SERVER_URL}${HANDLE_SEARCH}`;
    console.log("url", handleSearchUrl);
    const response = await fetch(handleSearchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: text,
      }),
    }).then((res) => res.json());
    setSearchResults(response.results);
    console.log("====================================");
    console.log("you found", response.results.length, "friends");
    console.log("====================================");
  };

  useEffect(() => {
    handleSearch("");
    const handleFetchFriends = async () => {
      const fetchFriendsUrl: string = `${SERVER_URL}${GET_FRIENDS_DATA}`;
      console.log("fetch", fetchFriendsUrl);
      const response = await fetch(fetchFriendsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: authenticatedUser._id,
        }),
      }).then((res) => res.json());
      console.log("response", response.friendsList);
      setFriends(response.friendsList);
    };
    handleFetchFriends();
  }, []);

  const handleResultLongPress = (val: string) => setIsHovered(val);

  const handleSendFriendRequest = async (userToRequestId: string) => {
    const sendFriendRequestUrl: string = `${SERVER_URL}${SEND_FRIEND_REQUEST}`;
    const response = await fetch(sendFriendRequestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currUserId: authenticatedUser._id,
        userToRequestId,
      }),
    }).then((res) => res.json());
    console.log("response is", response.message);
  };

  return (
    <View style={styles.rootContainer}>
      <SafeAreaView style={styles.notchContainer}>
        <Text style={styles.title}>AlertMe</Text>
        <View></View>

        <Pressable onPress={toggleModal}>
          <Image
            style={styles.searchIcon}
            source={require("../../assets/images/magnifier.png")}
          />
        </Pressable>

        {/* Modal */}
        <Modal
          animationType="none"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={toggleModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TextInput
                onChangeText={handleChange}
                value={input}
                style={styles.inputField}
                placeholder="Search"
              />
              {searchResults.length !== 0 ? (
                searchResults.map((result: IUser) => (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      // open profile code
                    }}
                    onPressIn={() => handleResultLongPress(result.username)}
                    onPressOut={() => handleResultLongPress("")}
                    style={[
                      styles.result,
                      isHovered === result.username
                        ? styles.hoveredResult
                        : null,
                    ]}
                  >
                    <Text style={styles.resultName}>
                      {result.username}
                      {authenticatedUser.username === result.username ? (
                        <Text style={styles.resultNameMatched}>(You)</Text>
                      ) : null}
                    </Text>
                    {authenticatedUser.username !== result.username ? (
                      <TouchableOpacity
                        onPress={() => handleSendFriendRequest(result._id)}
                      >
                        <Image
                          style={styles.addFriendIcon}
                          source={require("../../assets/images/addFriend.png")}
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

      <View style={styles.container}>
        {friends.length !== 0 &&
          friends.map((friend: IUser) => (
            <TouchableOpacity
              activeOpacity={1}
              key={friend._id}
              style={styles.friendItem}
              onPress={() => {
                console.log("here", friend.username);
              }}
            >
              <Text style={styles.friendText}>{friend.username}</Text>
            </TouchableOpacity>
          ))}
      </View>
      <BottomNavigation navigation={navigation} />
    </View>
  );
};

export default FriendsScreen;
