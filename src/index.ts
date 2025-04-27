import express from "express"
import authRouter from "./routes/auth.router.js"
import cors from "cors"
import dotenv from "dotenv"
import storeRouter from "./routes/store.router.js"

dotenv.config()
const app = express()
const PORT = process.env.PORT


app.use(express.json())
app.use(cors({
    origin: ["*"],
    credentials: true,
    methods: ["*"]
}))

app.use("/auth", authRouter)
app.use("/store", storeRouter)

app.listen(PORT, () => {
    console.log("Server Running:", PORT);
})