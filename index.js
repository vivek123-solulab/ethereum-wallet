
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from 'path';
import UserRoute from "./Routes/user.js";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config()
const app = express()

app.use(express.json())

// Routes
app.use("/users", UserRoute);
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
})

const PORT = process.env.PORT || 3000

mongoose
    .connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() =>
        app.listen(PORT, () => console.log(`Server running on port:${PORT}`))
    )
    .catch((error) => console.log(error.message))

