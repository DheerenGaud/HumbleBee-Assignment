// models/crop.model.js
import mongoose, { Schema } from "mongoose";

const cropSchema = new Schema( // Corrected variable name from cropSlice
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
    // REMOVE these individual fields:
    // latitude: {
    //   type: Number,
    //   required: true,
    //   min: -90,
    //   max: 90,
    // },
    // longitude: {
    //   type: Number,
    //   required: true,
    //   min: -180,
    //   max: 180,
    // },

    // ADD this location field using GeoJSON Point format
    location: {
      type: {
        type: String, // Don't declare `{ type: String }`
        enum: ['Point'], // 'location.type' must be 'Point'
        required: true,
      },
      coordinates: {
        type: [Number], // Array of numbers for longitude, latitude [lng, lat]
        required: true,
      },
    },

    recommendedHiveDensity: {
      type: Number,
      required: true,
      min: 0, // Density can't be negative
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

// ADD the 2dsphere index for efficient geospatial queries
cropSchema.index({ location: '2dsphere' });

export const Crop = mongoose.model("Crop", cropSchema); // Corrected schema variable name