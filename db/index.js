import mongoose from "mongoose";
import  {DB_NAME}  from "../constants.js";


// const connectDB = async () => {
//     try {
//         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
//     } catch (error) {
//         console.log("MONGODB connection FAILED ", error);
//         process.exit(1)
//     }
// }



const connectDB = async () => {
    // console.log(DB_NAME);
    try {
      await mongoose.connect(`mongodb://0.0.0.0:27017/${DB_NAME}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("\n\ndatabase is connected...");
    } catch (error) {
      console.log("some error in connecting database");
      throw error; 
    }
  };
  


export default connectDB