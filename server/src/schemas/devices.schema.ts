import { Schema, model } from "mongoose";
import { IDevice } from "../models/device.interface";

const deviceSchema = new Schema<IDevice>({
  fcmToken: { type: String, required: true},
});

export const Device = model<IDevice>("devices", deviceSchema);
