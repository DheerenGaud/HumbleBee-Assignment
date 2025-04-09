import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

import { Hive } from "../models/hive.model.js";

const addHive = asyncHandler(async(req,res)=>{
    const {} = req.body;

    try {

        const { hiveId, datePlaced, latitude, longitude, numColonies } = req.body;

        // Check all fields present
        if (!hiveId || !datePlaced || latitude === undefined || longitude === undefined || !numColonies) {
          throw new ApiError(400, "All fields are required.");
        }
      
        // Check Hive already exists
        const existingHive = await Hive.findOne({ hiveId });
        if (existingHive) {
          throw new ApiError(409, "Hive with this ID already exists.");
        }
      
        // Validate latitude & longitude
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
          throw new ApiError(400, "Invalid latitude or longitude values.");
        }
      
        // Create new Hive
        const hive = await Hive.create({
          hiveId,
          datePlaced,
          latitude,
          longitude,
          numColonies,
        });
      
        return res.status(201).json(
          new ApiResponse(201, hive, "Successfully added Hive.")
        );

        
    } catch (error) {
        throw new ApiError(
            error.statusCode || 500,
            error.message || "faile to add Hive .",
            [],
            error.stack
          );
    }

})


// controllers/hive.controller.js
// ... (keep imports and addHive)

const getHive = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query; // Add page and limit query params

    const query = {};

    // Apply date filter if provided
    if (startDate || endDate) {
      query.datePlaced = {};
      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) query.datePlaced.$gte = start;
        else throw new ApiError(400, "Invalid startDate format");
      }
      if (endDate) {
         const end = new Date(endDate);
         if (!isNaN(end.getTime())) query.datePlaced.$lte = end;
         else throw new ApiError(400, "Invalid endDate format");

         // Optional: Adjust end date to include the whole day
         // end.setHours(23, 59, 59, 999);
         // query.datePlaced.$lte = end;
      }
    }

    // Pagination options
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { datePlaced: -1 } // Keep sorting by latest first
    };

    // Use Mongoose paginate plugin (if installed) OR manual skip/limit
    // Manual skip/limit:
    const skip = (options.page - 1) * options.limit;

    const hives = await Hive.find(query)
                            .sort(options.sort)
                            .skip(skip)
                            .limit(options.limit);

    // Get total count for pagination metadata (optional but helpful)
    const totalHives = await Hive.countDocuments(query);

    const paginationData = {
        totalHives,
        totalPages: Math.ceil(totalHives / options.limit),
        currentPage: options.page,
        limit: options.limit
    }

    return res.status(200).json(
      // Include pagination data in the response if desired
      new ApiResponse(200, { hives, pagination: paginationData }, "Fetched hives successfully")
    );

  } catch (error) {
    // Make sure ApiErrors are re-thrown correctly for the handler
    if (error instanceof ApiError) {
        throw error;
    }
    // Handle unexpected errors
    throw new ApiError(
      500, // Use 500 for unexpected server errors
      error.message || "Failed to get Hives.",
      [],
      error.stack
    );
  }
});

export {
    addHive, getHive
}