import dotenv from "dotenv";
dotenv.config();

const envValue = (key: string, fallback = "") =>
  (process.env[key] || fallback).trim();

const env = {
  PORT: envValue("PORT", "5000"),
  NODE_ENV: envValue("NODE_ENV", "development"),
  MONGO_URI:
    envValue("MONGO_URI") || "mongodb://localhost:27017/vehicle-service-center",
  JWT_ACCESS_SECRET: envValue("JWT_ACCESS_SECRET", "access_secret_fallback"),
  JWT_REFRESH_SECRET: envValue(
    "JWT_REFRESH_SECRET",
    "refresh_secret_fallback",
  ),
  JWT_ACCESS_EXPIRES_IN: envValue("JWT_ACCESS_EXPIRES_IN", "15m"),
  JWT_REFRESH_EXPIRES_IN: envValue("JWT_REFRESH_EXPIRES_IN", "7d"),
  ADMIN_EMAIL: envValue("ADMIN_EMAIL", "admin@vehicleservice.com"),
  ADMIN_PASSWORD: envValue("ADMIN_PASSWORD", "Admin@123456"),
  ADMIN_NAME: envValue("ADMIN_NAME", "Super Admin"),
  CLIENT_ORIGIN: envValue("CLIENT_ORIGIN", "http://localhost:5173"),
  EMAILJS_SERVICE_ID: envValue("EMAILJS_SERVICE_ID"),
  EMAILJS_TEMPLATE_ID: envValue("EMAILJS_TEMPLATE_ID"),
  EMAILJS_PUBLIC_KEY: envValue("EMAILJS_PUBLIC_KEY"),
  EMAILJS_PRIVATE_KEY: envValue("EMAILJS_PRIVATE_KEY"),
};

export default env;
