import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    deviceID: { type: String, required: true },
    temperature: { type: Number },
    moisture: { type: Number },
    light: { type: Number },
    time: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("sensor_reading", schema);
