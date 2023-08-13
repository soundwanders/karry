import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MongoDB URI");
  }

  if (isConnected) {
    console.log("MongoDB connection already established");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Set up event listeners for connection events
    mongoose.connection.once("open", () => {
      isConnected = true;
      console.log("MongoDB connected");
    });

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      isConnected = false;
    });

    // Set strict query mode for Mongoose to prevent unknown field queries.
    mongoose.set("strictQuery", true);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error; // Rethrow the error for the caller to handle
  }
};

// Disconnect from the database when the app is terminated
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed due to app termination");
    process.exit(0);
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    process.exit(1);
  }
});
