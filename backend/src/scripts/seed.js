import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import { sampleTrains } from "../data/trains.js";
import { Train } from "../models/Train.js";
import { User } from "../models/User.js";

dotenv.config();

const ensureUser = async ({ name, email, password, phone, role }) => {
  let user = await User.findOne({ email });

  if (!user) {
    user = new User({
      name,
      email,
      password,
      phone,
      role,
    });
  } else {
    user.name = name;
    user.password = password;
    user.phone = phone;
    user.role = role;
  }

  await user.save();
  return user;
};

const seed = async () => {
  await connectDatabase();

  await Promise.all(
    sampleTrains.map((train) =>
      Train.findOneAndUpdate(
        { trainNumber: train.trainNumber },
        train,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          runValidators: true,
        }
      )
    )
  );

  const adminUser = await ensureUser({
    name: "Railway Admin",
    email: "admin@railwayhub.com",
    password: "Admin@123",
    phone: "9999999999",
    role: "admin",
  });

  const demoUser = await ensureUser({
    name: "Demo Passenger",
    email: "user@railwayhub.com",
    password: "User@123",
    phone: "8888888888",
    role: "user",
  });

  console.log(`Seeded ${sampleTrains.length} trains.`);
  console.log(`Admin login: ${adminUser.email} / Admin@123`);
  console.log(`Demo user login: ${demoUser.email} / User@123`);
};

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
