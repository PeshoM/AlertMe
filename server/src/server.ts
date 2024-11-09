import express, { Express } from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

const app: Express = express();
const port: string = process.env.PORT || "3000";

app.use(express.json());
app.use(cors({ origin: "*" }));

app.listen(port, () => {
  console.log("server is on");
});
