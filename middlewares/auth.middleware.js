import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // Extract token from cookies OR Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request: No token provided");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find user based on decoded ID, exclude password and refresh token
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      // This case might happen if the user was deleted after token issuance
      throw new ApiError(401, "Invalid Access Token: User not found");
    }

    // Attach user object to the request for subsequent middleware/controllers
    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        throw new ApiError(401, error?.message || "Invalid or expired access token");
    }
    // Re-throw other unexpected errors
     throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});


// --- Role Checking Middleware ---
export const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
             // Should be caught by verifyJWT first, but belts and suspenders
            throw new ApiError(401, "Authentication required");
        }

        if (!req.user.role || !allowedRoles.includes(req.user.role)) {
            throw new ApiError(
                403, // Forbidden: Authenticated but not authorized
                `Access denied. User role '${req.user.role}' is not authorized for this resource. Required roles: ${allowedRoles.join(', ')}`
            );
        }
        next(); // User has the required role
    };
};