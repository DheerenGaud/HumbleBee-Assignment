import express from "express";
import bodyparser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();





app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(bodyparser.urlencoded({ extended: true }));

import errorHandler from "./middlewares/errorHandler.middlewares.js"; // Path to the errorHandler file





import hiveRouter from './routes/hive.router.js';
import cropRouter from './routes/crop.router.js';
// import riderRouter from './routes/rider.router.js';
// import driverRouter from './routes/driver.router.js';


app.use("/api/hives", hiveRouter);
app.use("/api/crops", cropRouter);
// app.use("/api/v1/rider", riderRouter);
// app.use("/api/v1/driver", driverRouter);


app.get("/", (req, res) => {
    res.send("hello");
});


// this is for API always returns JSON-formatted error messages isted of sending html Error mag
app.use(errorHandler);

export { app };
