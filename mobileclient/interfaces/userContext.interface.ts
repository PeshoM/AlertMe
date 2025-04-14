import {ReactNode} from 'react';
import {IUser} from './user.interface';
import {Combination} from './combination.interface';
import {MutableRefObject} from 'react';

export interface userContextProps {
  children: ReactNode;
}

export interface UserContextType {
  authenticatedUser: IUser;
  setAuthenticatedUser: React.Dispatch<React.SetStateAction<IUser>>;
  receivedRequests: IUser[];
  setReceivedRequests: React.Dispatch<React.SetStateAction<IUser[]>>;
  sentRequests: IUser[];
  setSentRequests: React.Dispatch<React.SetStateAction<IUser[]>>;
  friends: IUser[];
  setFriends: React.Dispatch<React.SetStateAction<IUser[]>>;
  combinations: Combination[];
  setCombinations: React.Dispatch<React.SetStateAction<Combination[]>>;
  combinationsRef: MutableRefObject<Combination[]>;
}
