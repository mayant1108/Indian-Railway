import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDatabase } from "./config/db.js";
import { app } from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("ENV CHECK:", !!process.env.MONGODB_URI ? "✅ Loaded" : "❌ Missing MONGODB_URI");
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`🚂 Railway API running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
