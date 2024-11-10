import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },

  container: {
    flex: 1,
    paddingTop: "10%",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  logoContainer: {
    flexDirection: "row",
    position: "relative",
    alignItems: "baseline",
    marginBottom: 20,
    gap: 10,
  },

  logoImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },

  logoText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#333",
    alignSelf: "center",
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#170361",
    marginBottom: 10,
  },

  forgotPasswordText: {
    fontSize: 18,
    alignSelf: "flex-start",
    color: "#5a67d8",
    marginBottom: 30,
    fontWeight: "bold",
  },

  signInButton: {
    width: "100%",
    backgroundColor: "#5a67d8",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  signInButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  signUpText: {
    fontSize: 16,
    marginTop: 20,
    color: "#333",
    fontWeight: "bold",
  },

  signUpLink: {
    alignSelf: "flex-start",
    fontSize: 16,
    color: "#5a67d8",
    fontWeight: "bold",
  },

  fieldLabels: {
    color: "#333",
    fontSize: 18,
  },

  fieldWrapper: {
    width: "100%",
    gap: 10,
  },

  invalidInput: {
    color: "#bd062d",
    borderColor: "#bd062d",
  },

  invalidText: {
    fontSize: 14,
    color: "#FF0000",
  },

  contentWrapper: {
    flexDirection: "column",
    width: "100%",
    paddingHorizontal: 10,
  },

  fieldsDataContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },

  input: {
    width: "100%",
    fontSize: 16,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#acacac",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 60,
    fontSize: 16,
  },

  iconContainer: {
    padding: 10,
    position: "absolute",
    right: "1%",
  },

  icon: {
    width: 30,
    height: 30,
    tintColor: "#666",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  errorBox: {
    backgroundColor: "#dfdfdf",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#1c1c1c",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export { styles };
