const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error");
    console.error(err.message);
    console.error("Continuing in demo mode without database access");
  }
};

module.exports = connectDB;
