import express from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import connectToSocket from "./controllers/socketManager.js"
import userRoutes from "./routes/users.routes.js";



const app=express();
const server=createServer (app);
const io=connectToSocket(server);


app.set("port",(process.env.PORT || 8000));
app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb",extended:true}));



app.use("/api/v1/users",userRoutes);
// app.use("/api/v2/users",newUserRoutes);

const start =async()=>{
    const connectionDb = await mongoose.connect(
  "mongodb+srv://carmelitenidhi1234_db_user:nidhi1234%23%40@cluster0.9cyvclb.mongodb.net/Zoomdb"
);

    console.log(`Mongo connected DB host ${connectionDb.connection.host}`)
    server.listen(app.get("port"),()=>{
        console.log("Listening on port 8000")
    });
}
start();



