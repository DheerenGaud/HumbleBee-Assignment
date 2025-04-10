// controllers/auth.controller.js
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// --- Helper Function to Generate Tokens ---
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Store refresh token in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // Skip validation for this update

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token generation error:", error); // Log the specific error
    throw new ApiError(
      500,
      "Something went wrong while generating tokens",
      [],
      error.stack // Include stack trace if available
    );
  }
};


// --- Register User ---
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;
  
  
  if ([username, email, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "Username, email, and password are required");
  }
  console.log(username);
  
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  
  // Validate role if provided
  const userRole = role && ["admin", "beekeeper"].includes(role) ? role : "beekeeper";
  
  const user = await User.create({
    username: username.toLowerCase(),
    password, // Hashing happens in the pre-save hook
    email: email.toLowerCase(),
    role: userRole,
  });

  // Don't send password back
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// --- Login User ---
const loginUser = asyncHandler(async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    throw new ApiError(400, "Username/Email and password are required");
  }

  const user = await User.findOne({
    $or: [{ username: usernameOrEmail.toLowerCase() }, { email: usernameOrEmail.toLowerCase() }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials"); // Use 401 Unauthorized
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  // Options for setting cookies (secure in production)
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Set to true in production (HTTPS)
    sameSite: 'strict' // Helps prevent CSRF
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options) // Send token via secure cookie
    .cookie("refreshToken", refreshToken, options) // Send refresh token via secure cookie
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken, // Optionally still send in body
          refreshToken, // Optionally still send in body
        },
        "User logged in successfully"
      )
    );
});

// --- Logout User ---
const logoutUser = asyncHandler(async (req, res) => {
    // Assuming JWT strategy cleared user data attached by middleware if token was valid
    // For cookie-based session, you'd clear the session.
    // For JWT stored in DB (refresh token), clear it.

    // req.user should be populated by auth middleware
    if (!req.user?._id) {
        throw new ApiError(400, "User ID not found in request (requires auth)");
    }

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 } // Remove refreshToken field
        },
        { new: true } // Return the updated document (optional)
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0) // Set expiry to past date to clear cookie
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});


// --- Refresh Access Token --- (Optional but good practice)
const refreshAccessToken = asyncHandler(async (req, res) => {
    // Get refresh token from request body or cookie
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token (user not found)");
        }

        // Check if the stored refresh token matches the incoming one
        if (user.refreshToken !== incomingRefreshToken) {
             throw new ApiError(401, "Refresh token is expired or invalid"); // Token reuse suspicion
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );

    } catch (error) {
         // Handle JWT errors (expired, invalid signature etc.)
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            throw new ApiError(401, error?.message || "Invalid or expired refresh token");
        }
        throw error; // Re-throw other errors
    }
});


export { registerUser, loginUser, logoutUser, refreshAccessToken };