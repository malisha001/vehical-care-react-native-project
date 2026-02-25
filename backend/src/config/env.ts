import dotenv from "dotenv";
dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI:
    process.env.MONGO_URI || "mongodb://localhost:27017/vehicle-service-center",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "access_secret_fallback",
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || "refresh_secret_fallback",
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@vehicleservice.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "Admin@123456",
  ADMIN_NAME: process.env.ADMIN_NAME || "Super Admin",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:5173",
};

export default env;
