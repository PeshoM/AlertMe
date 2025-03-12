import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingIndicator: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  loadingText: {
    fontSize: 16,
    color: '#4a5568',
    fontWeight: '500',
  },

  profileHeader: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#5a67d8',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  avatarInitial: {
    fontSize: 42,
    color: '#5a67d8',
    fontWeight: 'bold',
  },

  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },

  friendStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#48bb78',
    borderRadius: 20,
    marginTop: 10,
  },

  friendStatusText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },

  actionContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  requestActionContainer: {
    width: '100%',
    alignItems: 'center',
  },

  requestPendingText: {
    fontSize: 18,
    color: '#4a5568',
    fontWeight: '600',
    marginBottom: 15,
  },

  handleRequestContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },

  optionButton: {
    marginHorizontal: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  acceptButton: {
    backgroundColor: '#48bb78',
  },

  rejectButton: {
    backgroundColor: '#e53e3e',
  },

  pendingContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  pendingText: {
    fontSize: 18,
    color: '#4a5568',
    fontWeight: 'bold',
    marginBottom: 8,
  },

  pendingSubtext: {
    fontSize: 14,
    color: '#718096',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  addFriendButton: {
    backgroundColor: '#5a67d8',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  removeFriendButton: {
    backgroundColor: '#e53e3e',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export {styles};
