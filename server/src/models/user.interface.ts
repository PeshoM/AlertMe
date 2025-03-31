import { Document, Types } from "mongoose";

export interface ICombination {
  id: string;
  name: string;
  target: Types.ObjectId;
  sequence: string[];
  createdAt: number;
  message?: string;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  friends: Types.ObjectId[];
  receivedFriendRequests: Types.ObjectId[];
  sentFriendRequests: Types.ObjectId[];
  devices: string[];
  combinations: ICombination[];
}

export type IUserWithFriends = IUser & {
  friendsList: IUser[];
  receivedFriendRequests: IUser[];
  sentFriendRequests: IUser[];
};
