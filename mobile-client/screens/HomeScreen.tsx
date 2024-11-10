import { SafeAreaView, View, ScrollView, Text } from "react-native";
import { styles } from "../styles/auth.styles";
import { useContext } from "react";
import { HomeScreenProps } from "../types/screen.props";
import { UserContext } from "../Context";
import React from "react";

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { authenticatedUser } = useContext(UserContext);

  return (
    <SafeAreaView style={styles.rootContainer}>
      <ScrollView>
        <View style={styles.container}>
          <Text>Hello, {authenticatedUser.username}!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
