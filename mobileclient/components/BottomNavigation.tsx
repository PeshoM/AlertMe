import React from "react";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { View, Text, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import { AppParamList } from "../types/app.param.list";

const BottomNavigation = () => {
  const navigation = useNavigation<NavigationProp<AppParamList>>();

  const handlePressDashboard = () => {
    navigation.navigate("Home");
  };
  const handlePressFriends = () => {
    navigation.navigate("Friends");
  };

  return (
    <View style={styles.bottomNavigation}>
      <TouchableOpacity style={styles.navButton}>
        <Text style={styles.navLabel}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handlePressDashboard} style={styles.navButton}>
        <Text style={styles.navLabel}>Dashboard</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handlePressFriends} style={styles.navButton}>
        <Text style={styles.navLabel}>Friends</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  navButton: {
    alignItems: "center",
    paddingVertical: 5,
  },
  navLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});

export default BottomNavigation;
