import {IUser} from './interfaces/user.interface';
import React, {createContext, useState} from 'react';
import {
  userContextProps,
  UserContextType,
} from './interfaces/userContext.interface';

const defaultUser: IUser = {
  _id: '',
  username: '',
  email: '',
  password: '',
  friends: [],
  receivedFriendRequests: [],
  sentFriendRequests: [],
  devices: [],
};

const UserContext = createContext<UserContextType>({
  authenticatedUser: defaultUser,
  setAuthenticatedUser: () => {},
  receivedRequests: [],
  setReceivedRequests: () => {},
  sentRequests: [],
  setSentRequests: () => {},
  friends: [],
  setFriends: () => {},
});

const Context = ({children}: userContextProps) => {
  const [authenticatedUser, setAuthenticatedUser] =
    useState<IUser>(defaultUser);
  const [receivedRequests, setReceivedRequests] = useState<IUser[]>([]);
  const [sentRequests, setSentRequests] = useState<IUser[]>([]);
  const [friends, setFriends] = useState<IUser[]>([]);

  return (
    <UserContext.Provider
      value={{
        authenticatedUser,
        setAuthenticatedUser,
        receivedRequests,
        setReceivedRequests,
        sentRequests,
        setSentRequests,
        friends,
        setFriends,
      }}>
      {children}
    </UserContext.Provider>
  );
};

export {Context, UserContext};
