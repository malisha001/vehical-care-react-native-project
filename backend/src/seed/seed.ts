import "dotenv/config";
import mongoose from "mongoose";
import env from "../config/env";
import User from "../models/User";
import CleaningService from "../models/CleaningService";
import ModificationItem from "../models/ModificationItem";
import RepairSlot from "../models/RepairSlot";

const seedDatabase = async () => {
  await mongoose.connect(env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // ─── Seed Admin User ───────────────────────────────────────
  const existingAdmin = await User.findOne({ email: env.ADMIN_EMAIL });
  if (!existingAdmin) {
    await User.create({
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
      role: "ADMIN",
    });
    console.log(`✅ Admin user created: ${env.ADMIN_EMAIL}`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${env.ADMIN_EMAIL}`);
  }

  // ─── Seed Cleaning Services ────────────────────────────────
  const cleaningCount = await CleaningService.countDocuments();
  if (cleaningCount === 0) {
    await CleaningService.insertMany([
      {
        name: "Body Wash",
        description: "Complete exterior body wash with premium foam and rinse",
        price: 500,
        duration: "45 mins",
        isActive: true,
      },
      {
        name: "Full Service",
        description:
          "Complete interior and exterior cleaning with vacuuming, wipe-down, and wash",
        price: 1500,
        duration: "2 hours",
        isActive: true,
      },
      {
        name: "Nano Coating",
        description:
          "Long-lasting nano ceramic coating for paint protection and glossy finish",
        price: 8000,
        duration: "4 hours",
        isActive: true,
      },
      {
        name: "Under Wash",
        description:
          "High-pressure underbody wash to remove mud, rust, and corrosion",
        price: 800,
        duration: "30 mins",
        isActive: true,
      },
    ]);
    console.log("✅ Cleaning services seeded");
  }

  // ─── Seed Modification Items ───────────────────────────────
  const modCount = await ModificationItem.countDocuments();
  if (modCount === 0) {
    await ModificationItem.insertMany([
      {
        name: "Sport Exhaust System",
        brand: "Akrapovic",
        category: "Exhaust",
        description:
          "High-performance titanium sport exhaust system with deep sound",
        images: ["https://via.placeholder.com/400x300?text=Sport+Exhaust"],
        stockQty: 5,
        tags: ["exhaust", "sport", "performance"],
      },
      {
        name: "LED Headlight Kit",
        brand: "Philips",
        category: "Lighting",
        description:
          "Ultra-bright LED headlight conversion kit with 6000K daylight",
        images: ["https://via.placeholder.com/400x300?text=LED+Headlights"],
        stockQty: 12,
        tags: ["led", "headlight", "lighting"],
      },
      {
        name: "Carbon Fiber Hood",
        brand: "Seibon",
        category: "Body Kit",
        description:
          "Lightweight carbon fiber hood for weight reduction and aggressive look",
        images: ["https://via.placeholder.com/400x300?text=Carbon+Hood"],
        stockQty: 3,
        tags: ["carbon", "body", "hood"],
      },
      {
        name: "Coilover Suspension Kit",
        brand: "KW",
        category: "Suspension",
        description:
          "Adjustable coilover kit for improved handling and lowered stance",
        images: ["https://via.placeholder.com/400x300?text=Coilovers"],
        stockQty: 8,
        tags: ["suspension", "coilover", "handling"],
      },
      {
        name: "Cold Air Intake",
        brand: "K&N",
        category: "Engine",
        description:
          "High-flow cold air intake for increased horsepower and fuel efficiency",
        images: ["https://via.placeholder.com/400x300?text=Cold+Air+Intake"],
        stockQty: 0,
        tags: ["intake", "engine", "performance"],
      },
    ]);
    console.log("✅ Modification items seeded");
  }

  // ─── Seed Repair Slots (next 7 days) ──────────────────────
  const slotCount = await RepairSlot.countDocuments();
  if (slotCount === 0) {
    const timeSlots = [
      "09:00-10:00",
      "10:00-11:00",
      "11:00-12:00",
      "14:00-15:00",
      "15:00-16:00",
      "16:00-17:00",
    ];

    const slots = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      for (const timeSlot of timeSlots) {
        slots.push({
          date: dateStr,
          timeSlot,
          isAvailable: true,
          maxBookings: 2,
        });
      }
    }
    await RepairSlot.insertMany(slots, { ordered: false });
    console.log(`✅ ${slots.length} repair slots seeded for next 7 days`);
  }

  console.log("🎉 Seeding complete!");
  process.exit(0);
};

seedDatabase().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
