import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    rootContainer: {
      flex: 1,
      backgroundColor: "#f2f2f2",
      justifyContent: "center",
      alignItems: "center",
    },
  
    friendUsernameContainer: {
      width: "80%",
      borderBottomColor: "gray",
      borderBottomWidth: 1,
      alignItems: "center",
    },
  
    friendUsername: {
      fontSize: 50,
      color: "gray",
    },
  
    alreadyFriends: {
      marginTop: 20,
      fontSize: 20,
      color: "gray",
    },
  
    optionButton: {
      flex: 1,
      marginHorizontal: 10,
      backgroundColor: "#007bff",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: "center",
    },
  
    rejectButton: {
      backgroundColor: "#dc3545",
    },
  
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  
    addFriendButton: {
      backgroundColor: "#28a745",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 20,
    },
  
    addFriendIcon: {
      width: 50,
      height: 50,
    },
  
    handleRequestContainer: {
      flexDirection: "row",
      gap: 10,
      marginTop: 20,
    },
  });
  

export { styles };
