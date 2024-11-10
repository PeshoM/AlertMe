export interface IUser {
  username: string;
  email: string;
  password: string;
  friends: string[];
  receivedFriendRequests: string[];
  sentFriendRequests: string[];
}
