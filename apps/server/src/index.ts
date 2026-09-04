import cors from "cors";
import express from "express";
import { syncRouter } from "./sync/router.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(syncRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
