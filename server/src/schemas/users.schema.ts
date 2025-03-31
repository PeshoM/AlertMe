import { Schema, model } from "mongoose";
import { IUser } from "../models/user.interface";

const combinationSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  target: { type: Schema.Types.ObjectId, required: true },
  sequence: [
    { type: String, enum: ["volumeUp", "volumeDown"], required: true },
  ],
  createdAt: { type: Number, default: Date.now },
  message: { type: String, default: "" },
});

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  receivedFriendRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
  sentFriendRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
  devices: [{ type: String, ref: "Device" }],
  combinations: [combinationSchema],
});

export const User = model<IUser>("users", userSchema);
