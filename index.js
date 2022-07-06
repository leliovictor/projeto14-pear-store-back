import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";

import router from "./routes/index.js";

dotenv.config();

const app = express();

app.use(json());
app.use(cors());
app.use(router);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is up on port: ${port}`);
});
