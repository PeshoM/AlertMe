import { Schema, model } from "mongoose";
import { IUser } from "../models/user.interface";

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  receivedFriendRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
  sentFriendRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
  devices: [{ type: String, ref: "Device" }],
});

export const User = model<IUser>("users", userSchema);
