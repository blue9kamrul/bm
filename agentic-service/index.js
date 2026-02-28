import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import negotiationRoutes from './routes/negotiation.routes.js';
import { errorHandler } from '../server/lib/errorHandler.js';
import connectToDB from './configs/mongodb.js';

dotenv.config();

const app = express();

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

app.set('trust proxy', 1);
app.use(express.json());
const port = process.env.PORT || 5001;
connectToDB();

app.use('/api/v2/agents', negotiationRoutes);
app.get('/', (req, res) => res.send('Hello from agentic service!'))


app.use(errorHandler);
app.listen(port, () => console.log(`Agentic service listening on port ${port}!`))