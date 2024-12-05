export interface IUser {
  [x: string]: any;
  username: string;
  email: string;
  password: string;
  friends: string[];
  receivedFriendRequests: string[];
  sentFriendRequests: string[];
  devices: string[];
}
