import { Schema, model } from 'mongoose';

export interface user {
    username: string;
    email: string;
    password: string;
};

const userSchema = new Schema<user>({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true },
  });
  
export const User = model<user>("users", userSchema);