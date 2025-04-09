import mongoose, { Schema } from "mongoose";

const HiveSchema = new Schema(
  {
    hiveId: {
      type: String,
      required: true,
      unique: true,
    },
    datePlaced: {
      type: Date,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    numColonies: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);


export const Hive = mongoose.model("Hive", HiveSchema);