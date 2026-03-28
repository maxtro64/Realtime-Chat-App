import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import { server } from "./config/socket.js";

const PORT = process.env.NODE_PORT;

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
