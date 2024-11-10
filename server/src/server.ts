import express, { Express } from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import authRouter from "./routes/auth.route";

dotenv.config();

const app: Express = express();
const port: string = process.env.PORT || "3000";

app.use(express.json());
app.use(cors({ origin: "*" }));

app.use(authRouter);

process.env.DATA_CONNECTION &&
  mongoose
    .connect(process.env.DATA_CONNECTION)
    .then(() => {
      console.log("Connected to MongoDB successfully");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
    });

app.listen(port, () => {
  console.log("server is on");
});
