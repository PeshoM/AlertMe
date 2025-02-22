import {ReactNode} from 'react';
import {IUser} from './user.interface';

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
}
