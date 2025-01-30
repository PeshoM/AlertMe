import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  notchContainer: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "gray",
  },

  container: {
    flex: 1,
    padding: 0,
    margin: 0,
    backgroundColor: "#ffffff",
  },

  friendItem: {
    width: "100%",
    height: 50,
    backgroundColor: "rgba(90, 103, 216, 0.9)",
    justifyContent: "center",
    alignSelf: "stretch",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  friendText: {
    fontSize: 16,
    color: "#ffffff",
    paddingLeft: 20,
  },

  title: {
    fontSize: 30,
    color: "black",
  },

  searchIcon: {
    width: 50,
    height: 50,
  },

  addFriendIcon: {
    width: 30,
    height: 30,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  modalContent: {
    flex: 1,
    width: "100%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  inputField: {
    width: "100%",
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#5a67d8",
    paddingLeft: 10,
    fontSize: 26,
    marginBottom: 20,
    backgroundColor: "#bbb",
    borderRadius: 8,
  },

  result: {
    width: "100%",
    height: 75,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },

  hoveredResult: {
    backgroundColor: "#ccc",
  },

  resultName: {
    fontSize: 26,
    color: "gray",
  },

  resultNameMatched: {
    fontSize: 15,
  },
});

export { styles };
