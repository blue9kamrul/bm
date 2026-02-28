import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "./lib/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import cors from "cors";
import { multerErrorHandler } from "./lib/multerErrorHandler.js";
import path from "path";
import { fileURLToPath } from "url";
import { startAuthServer } from "./grpc/authService.js";

import bccRoutes from "./routes/bcc.routes.js";
import rccRoutes from "./routes/rcc.routes.js";
import userRoutes from "./routes/user.routes.js";
import rentalRequestRoutes from "./routes/rentalRequest.routes.js";
import adminRentalRequestsRoutes from "./routes/rentalRequest.admin.routes.js";
import userDashboardRoutes from "./routes/userDashboard.routes.js";
import withdrawalRequestRoutes from "./routes/withdrawalRequest.routes.js";
import adminDashBoardRoutes from "./routes/adminDashboard.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import adminPurchaseRoutes from "./routes/admin-routes/purchaseRequestAdmin.routes.js";
import userPurchaseRoutes from "./routes/user-routes/purchaseRequestUser.routes.js";
import chatRoutes from "./routes/user-routes/purcaseChat.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import publicRoutes from "./routes/open-apis/userProfile.routes.js"

import { createServer } from "http";
import { initializeSocket } from "./socket/chatSocket.js";

startAuthServer();

dotenv.config();
const app = express();

const server = createServer(app);
//Socket.IO init
initializeSocket(server);

// for open source
const publicCors = cors({
  origin: "*", // allorigins
  methods: ["GET", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: false,
  maxAge: 86400
});

// CORS Policy
const devOrigins = ["http://localhost:5173", "http://localhost:5000", "http://localhost:5001", "http://127.0.0.1:5001", "http://127.0.0.1:5173"];
const prodOrigins = [
  "https://brittoo.xyz",
  "https://www.brittoo.xyz",
  "https://api.brittoo.xyz",
  "https://agentic.brittoo.xyz",
];

const allowedOrigins = process.env.NODE_ENV === "production" ? prodOrigins : [...prodOrigins, ...devOrigins];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));



app.set("trust proxy", 1);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
const PORT = process.env.PORT || 5000;

//File Handlers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//routes
app.get("/", (req, res) => {
  res.send("Britto Server is Running....");
});

// public
app.use("/api/v1/public", publicCors, publicRoutes);

// conf
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/credit/bcc", bccRoutes);
app.use("/api/v1/credit/rcc", rccRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/rental-requests", rentalRequestRoutes);
app.use("/api/v1/admin/rental-requests", adminRentalRequestsRoutes);
app.use("/api/v1/user-dashboard", userDashboardRoutes);
app.use("/api/v1/withdrawal-requests", withdrawalRequestRoutes);
app.use("/api/v1/admin-dash", adminDashBoardRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/purchase", userPurchaseRoutes);
app.use("/api/v1/admin/purchase", adminPurchaseRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/notifications", notificationRoutes);

app.use(errorHandler);
app.use(multerErrorHandler);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is dancing on http://localhost:${PORT} \n${new Date(Date.now()).toLocaleTimeString()}`);
});

// ngrok http --url=evolving-champion-bullfrog.ngrok-free.app 80
