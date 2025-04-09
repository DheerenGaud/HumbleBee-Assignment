// controllers/crop.controller.js
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Crop } from "../models/crop.model.js";

// --- Modified addCrop function ---
const addCrop = asyncHandler(async (req, res) => {
  const { name, floweringStart, floweringEnd, latitude, longitude, recommendedHiveDensity } = req.body;

  // We'll keep the same initial validation logic
  // Check all fields present
  if (
    !name ||
    !floweringStart ||
    !floweringEnd ||
    latitude === undefined || // Keep checking individual lat/lng from request
    longitude === undefined ||
    recommendedHiveDensity === undefined // Check density specifically
  ) {
    throw new ApiError(400, "All fields are required.");
  }

  // Validate latitude & longitude range from request
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new ApiError(400, "Invalid latitude or longitude values.");
  }

  // Validate recommendedHiveDensity
  if (recommendedHiveDensity < 0) {
      throw new ApiError(400, "Recommended hive density cannot be negative.");
  }

  // Check flowering dates
  const start = new Date(floweringStart);
  const end = new Date(floweringEnd);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ApiError(400, "Invalid date format for flowering start or end.");
  }
  if (start > end) {
    throw new ApiError(400, "Flowering start date cannot be after end date.");
  }

  // Create the GeoJSON Point structure for storage
  const location = {
    type: 'Point',
    coordinates: [longitude, latitude] // Longitude, Latitude order!
  };

  // Create Crop using the new location structure
  const crop = await Crop.create({
    name,
    floweringStart: start, // Use the Date objects
    floweringEnd: end,     // Use the Date objects
    location, // Store the GeoJSON object
    recommendedHiveDensity,
  });

  // Check if crop creation was successful (though create throws on error)
  if (!crop) {
      throw new ApiError(500, "Failed to add crop to the database.");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, crop, "Successfully added Crop."));

  // Removed the generic try-catch wrapping the whole function
  // asyncHandler already handles promise rejections and passes errors to the error handler
});


// --- NEW getNearbyCrops function ---
const getNearbyCrops = asyncHandler(async (req, res) => {
  const { latitude, longitude, radius, date } = req.query;

  // 1. Validate Inputs
  if (latitude === undefined || longitude === undefined) {
    throw new ApiError(400, "Latitude and Longitude query parameters are required.");
  }

  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new ApiError(400, "Invalid or out-of-range latitude or longitude values.");
  }

  // Radius: Optional, default 100km. Convert to meters for MongoDB.
  let radiusInMeters = 100 * 1000; // Default 100km in meters
  if (radius !== undefined) {
    const parsedRadius = parseInt(radius, 10);
    if (isNaN(parsedRadius) || parsedRadius <= 0) {
      throw new ApiError(400, "Invalid radius value. Must be a positive number (km).");
    }
    radiusInMeters = parsedRadius * 1000;
  }

  // Date: Optional, defaults to today.
  let queryDate;
  if (date) {
      queryDate = new Date(date);
      if (isNaN(queryDate.getTime())) {
          throw new ApiError(400, "Invalid date format for query.");
      }
  } else {
      queryDate = new Date(); // Default to today
      queryDate.setHours(0, 0, 0, 0); // Optional: Set to start of today for consistent matching
  }


  // 2. Construct MongoDB Query
  const query = {
    // Geospatial query using the 2dsphere index
    location: {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [lon, lat] // ! Longitude first, then Latitude
        },
        $maxDistance: radiusInMeters // Max distance in meters
      }
    },
    // Date range query: crop must be flowering on the queryDate
    floweringStart: { $lte: queryDate },
    floweringEnd: { $gte: queryDate }
  };

  // 3. Execute Query
  const nearbyCrops = await Crop.find(query);

  // 4. Handle Empty Response
  if (!nearbyCrops || nearbyCrops.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, [], "No nearby crop opportunities found matching the criteria.")
    );
  }

  // 5. Return Results
  return res.status(200).json(
    new ApiResponse(200, nearbyCrops, "Successfully retrieved nearby crop opportunities.")
  );

});


export { addCrop, getNearbyCrops }; // Export the new function