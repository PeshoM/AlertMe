import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../styles/home.styles";
import { useContext } from "react";
import { HomeScreenProps } from "../types/screen.props";
import { UserContext } from "../Context";
import { useFcmToken } from "../useFcmToken";
import BottomNavigation from "../components/BottomNavigation";

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { authenticatedUser } = useContext(UserContext);
  const { fcmToken } = useFcmToken();

  useEffect(() => {
    console.log("test log in homescreen", authenticatedUser);
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileSection}>
        <Text style={styles.greetingText}>
          Hello, {authenticatedUser?.username}!
        </Text>
      </View>
      <View style={styles.separator} />

      <View style={styles.content}>
        <Text>{fcmToken}</Text>
      </View>

      <BottomNavigation navigation={navigation} />
    </SafeAreaView>
  );
};

export default HomeScreen;
