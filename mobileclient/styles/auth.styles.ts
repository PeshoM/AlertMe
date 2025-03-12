import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  container: {
    flex: 1,
    paddingTop: '10%',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 12,
  },

  logoImage: {
    width: 70,
    height: 70,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5a67d8',
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a202c',
    marginBottom: 24,
    alignSelf: 'flex-start',
  },

  forgotPasswordText: {
    fontSize: 14,
    alignSelf: 'flex-end',
    color: '#5a67d8',
    marginBottom: 30,
    fontWeight: '600',
  },

  signInButton: {
    width: '100%',
    backgroundColor: '#5a67d8',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },

  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  signUpText: {
    fontSize: 14,
    color: '#4a5568',
  },

  signUpLink: {
    color: '#5a67d8',
    fontWeight: '600',
    marginLeft: 5,
    fontSize: 14,
  },

  fieldLabels: {
    color: '#4a5568',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 2,
  },

  fieldWrapper: {
    width: '100%',
    marginBottom: 16,
  },

  invalidInput: {
    borderColor: '#e53e3e',
    color: '#e53e3e',
  },

  invalidText: {
    color: '#e53e3e',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },

  contentWrapper: {
    flexDirection: 'column',
    width: '100%',
  },

  fieldsDataContainer: {
    width: '100%',
    marginBottom: 10,
  },

  input: {
    width: '100%',
    fontSize: 16,
    color: '#1a202c',
    height: '100%',
  },

  inputPassword: {
    width: '100%',
    fontSize: 16,
    color: '#1a202c',
    paddingRight: 45,
    height: '100%',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 50,
    backgroundColor: '#ffffff',
  },

  inputContainerPassword: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 50,
    width: '100%',
    backgroundColor: '#ffffff',
  },

  iconContainer: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  },

  icon: {
    width: 24,
    height: 24,
    tintColor: '#a0aec0',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  errorBox: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  errorText: {
    color: '#e53e3e',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export {styles};
