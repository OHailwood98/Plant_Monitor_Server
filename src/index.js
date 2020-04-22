import express from "express"
import path from "path";
import mongoose from "mongoose"
import bodyParser from "body-parser";
import dotenv from "dotenv";
import Promise from "bluebird";
import helmet from "helmet"

import reading from "./routes/reading"
import user from "./routes/user"

dotenv.config(); 

const app = express();
app.use(helmet());
app.use(bodyParser.json());
mongoose.Promise = Promise;
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect(process.env.MONGODB_URL_Local, { useNewUrlParser: true });

app.use("/api/reading", reading);

app.use("/api/user", user);

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(8080, () => console.log("listening on 8080"));
//app.listen(process.env.PORT)