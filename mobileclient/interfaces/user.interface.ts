export interface IUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  friends: string[];
  receivedFriendRequests: string[];
  sentFriendRequests: string[];
  devices: string[];
  combinations: ICombination[];
}

export interface ICombination {
  id: string;
  name: string;
  target: string;
  sequence: string[];
  createdAt: number;
}
