import {IUser} from './interfaces/user.interface';
import {Combination} from './interfaces/combination.interface';
import React, {createContext, useState, useRef} from 'react';
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
  combinations: [],
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
  combinations: [],
  setCombinations: () => {},
  combinationsRef: {current: []},
});

const Context = ({children}: userContextProps) => {
  const [authenticatedUser, setAuthenticatedUser] =
    useState<IUser>(defaultUser);
  const [receivedRequests, setReceivedRequests] = useState<IUser[]>([]);
  const [sentRequests, setSentRequests] = useState<IUser[]>([]);
  const [friends, setFriends] = useState<IUser[]>([]);
  const [combinations, setCombinations] = useState<Combination[]>([]);

  const combinationsRef = useRef<Combination[]>([]);

  React.useEffect(() => {
    combinationsRef.current = combinations;
  }, [combinations]);

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
        combinations,
        setCombinations,
        combinationsRef,
      }}>
      {children}
    </UserContext.Provider>
  );
};

export {Context, UserContext};
