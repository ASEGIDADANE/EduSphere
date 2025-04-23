// import mongoose from "mongoose";

// const connectDB = async (): Promise<void> => {
//   try {
//     console.log("MongoDB Connection String:", process.env.CONNECTION_STRING); // Debug log

//     await mongoose.connect(process.env.CONNECTION_STRING as string, {
  
//       autoIndex: false, // Disable auto-creation of indexes for performance
//     });

//     console.log("✅ MongoDB Connected", mongoose.connection.host, mongoose.connection.name);

//     // Add event listeners for connection
//     mongoose.connection.on("connected", () => {
//       console.log("✅ Mongoose connected to the database");
//     });

//     mongoose.connection.on("error", (err) => {
//       console.error("❌ Mongoose connection error:", err);
//     });

//     mongoose.connection.on("disconnected", () => {
//       console.log("⚠️ Mongoose disconnected");
//     }); 
//   } catch (error) {
//     console.error("❌ MongoDB Connection Failed:", error);
//     process.exit(1); // Exit the process with failure
//   }
// };

// export default connectDB;

import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING as string, {
    });
    console.log("✅ MongoDB Connected", mongoose.connection.host, mongoose.connection.name);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

export default connectDB;