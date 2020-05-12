import mongoose from "mongoose";
import validator from "mongoose-unique-validator";

const schema = new mongoose.Schema(
  {
    deviceID: { type: String, required: true, unique: true },
    deviceName: { type: String, required: true },
    username: { type: String, required: true },
    tempMin: { type: Number, default: 0 },
    tempMax: { type: Number, default: 0 },
    moistMin: { type: Number, default: 0 },
    moistMax: { type: Number, default: 0 },
    url: { type: String},
    lastMessage:{ type: Date }
  },
  { timestamps: true }
);

schema.plugin(validator, { message: "Invalid ID" });
export default mongoose.model("device", schema);
