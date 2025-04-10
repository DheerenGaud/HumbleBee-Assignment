import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

import { Hive } from "../models/hive.model.js";
import { parse } from 'json2csv';

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

const getHive = asyncHandler(async (req, res) => {
  // No try-catch needed, asyncHandler handles it

    const { startDate, endDate, page = 1, limit = 10, lastSyncTimestamp } = req.query; // Add lastSyncTimestamp

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
      }
    }

    // --- Sync Token Logic ---
    // If lastSyncTimestamp is provided, filter records updated *after* that time
    if (lastSyncTimestamp) {
        const syncDate = new Date(lastSyncTimestamp);
        if (isNaN(syncDate.getTime())) {
            throw new ApiError(400, "Invalid lastSyncTimestamp format. Use ISO 8601 UTC.");
        }
        // Query based on 'updatedAt' - includes creates and updates
        query.updatedAt = { $gt: syncDate };
    }
    // --- End Sync Token Logic ---


    // Pagination options
    const options = {
        page: parseInt(page, 10) || 1, // Ensure valid numbers
        limit: parseInt(limit, 10) || 10, // Ensure valid numbers
        // Sort by update time descending to easily find the latest for the new sync token
        sort: { updatedAt: -1 } // Sort by most recently updated first
        // If you only want newly *created* items for sync, use:
        // sort: { createdAt: -1 }
        // query.createdAt = { $gt: syncDate }; instead of updatedAt
    };

     if(options.page < 1) options.page = 1;
     if(options.limit < 1) options.limit = 10;


    // Manual skip/limit:
    const skip = (options.page - 1) * options.limit;

    // Execute query without lean() if you need Mongoose documents,
    // but lean() is faster for read-only operations.
    const hives = await Hive.find(query)
                            .sort(options.sort)
                            .skip(skip)
                            .limit(options.limit)
                            .lean(); // Use lean for performance

    // Get total count matching the filter (ignoring pagination for total)
    const totalHives = await Hive.countDocuments(query);

    // --- Determine New Sync Timestamp ---
    let newSyncTimestamp = lastSyncTimestamp; // Default to old one if no new records
    if (hives.length > 0) {
        // Since we sorted by `updatedAt: -1`, the first item is the latest
        newSyncTimestamp = hives[0].updatedAt.toISOString();
    } else if (!lastSyncTimestamp) {
        // If it's the first sync and no records are found, use current time
        newSyncTimestamp = new Date().toISOString();
    }
     // --- End Determine New Sync Timestamp ---


    const paginationData = {
        totalHives,
        totalPages: Math.ceil(totalHives / options.limit),
        currentPage: options.page,
        limit: options.limit
    }

    return res.status(200).json(
      new ApiResponse(200,
        {
            hives,
            pagination: paginationData,
            newSyncTimestamp // Include the new sync timestamp in the response
        },
        "Fetched hives successfully"
      )
    );

  // Removed explicit try-catch block as asyncHandler manages errors
});

const exportHivesCSV = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query; // Optional date filters

  const query = {};

  // Apply date filter if provided (similar to getHive)
  if (startDate || endDate) {
      query.datePlaced = {};
      if (startDate) {
          const start = new Date(startDate);
          if (!isNaN(start.getTime())) query.datePlaced.$gte = start;
          else throw new ApiError(400, "Invalid startDate format for export");
      }
      if (endDate) {
          const end = new Date(endDate);
          if (!isNaN(end.getTime())) query.datePlaced.$lte = end;
          else throw new ApiError(400, "Invalid endDate format for export");
      }
  }

  console.log(query);
  

  try {
      // Fetch all matching hives (no pagination for export)
      // Select fields to include in CSV, excluding _id and __v
      const hives = await Hive.find(query)
                              .select('hiveId datePlaced latitude longitude numColonies createdAt updatedAt -_id')
                              .lean(); // Use lean() for performance on large datasets
      console.log(hives);
      
      if (!hives || hives.length === 0) {
          // Option 1: Send empty CSV
          // res.setHeader('Content-Type', 'text/csv');
          // res.setHeader('Content-Disposition', 'attachment; filename=hives_export.csv');
          // return res.status(200).send(''); // Empty file

          // Option 2: Send a message
           return res.status(200).json(new ApiResponse(200, [], "No hives found matching criteria for export."));

      }

      // Define CSV fields and headers (optional customization)
      const fields = ['hiveId', 'datePlaced', 'latitude', 'longitude', 'numColonies', 'createdAt', 'updatedAt'];
      const opts = { fields };

      // Convert JSON data to CSV
      const csv = parse(hives, opts);

      // Set response headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=hives_export.csv'); // Suggest filename

      // Send CSV data
      res.status(200).send(csv);

  } catch (error) {
      console.error("CSV Export Error:", error);
      // Ensure ApiErrors are handled correctly
      if (error instanceof ApiError) {
          throw error;
      }
      throw new ApiError(500, "Failed to generate CSV export.", [], error.stack);
  }
});

export {
    addHive, getHive, exportHivesCSV
}