import mongoose, { Schema } from "mongoose";

const cropSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    floweringStart: {
      type: Date,
      required: true,
    },
    floweringEnd: {
      type: Date,
      required: true,
    },
  
    location: {
      type: {
        type: String, 
        enum: ['Point'], 
        required: true,
      },
      coordinates: {
        type: [Number], 
        required: true,
      },
    },

    recommendedHiveDensity: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true, 
  }
);

// ADD the 2dsphere index for efficient geospatial queries
cropSchema.index({ location: '2dsphere' });

export const Crop = mongoose.model("Crop", cropSchema); 