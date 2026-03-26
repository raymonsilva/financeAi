import app from "./app";
import { env } from "./config/env";
import mongoose from "mongoose";
import dns from "dns";

dns.setServers(['8.8.8.8', '8.8.4.4']);

const PORT = env.PORT || 3000;

let hasStartedServer = false;

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("Connected to MongoDB");

    if (!hasStartedServer) {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
      hasStartedServer = true;
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);

    // Keep container alive and retry, so infra/network fixes in Atlas can recover without a new deploy.
    setTimeout(() => {
      void connectDB();
    }, 10000);
  }
};

void connectDB();
