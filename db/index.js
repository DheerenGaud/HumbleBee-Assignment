import mongoose from "mongoose";


const connectDB = async () => {
    console.log("Cloud Db Connection Started");
    
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}



// const connectDB = async () => {
  // console.log("Local Db Connection Started");
  //     try {
//       await mongoose.connect(process.env.MONGODB_URI, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//       });
//       console.log("\n\ndatabase is connected...");
      
//     } catch (error) {
//       console.log("some error in connecting database");
//       throw error; 
//     }
//   };
  


export default connectDB