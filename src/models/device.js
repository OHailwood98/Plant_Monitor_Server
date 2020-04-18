import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    deviceID: { type: String, required: true },
    deviceName: { type: String, required: true },
    tempMin: { type: Number, default: 0 },
    tempMax: { type: Number, default: 0 },
    moistMin: { type: Number, default: 0 },
    moistMax: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("device", schema);
