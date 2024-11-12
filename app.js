const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require('multer');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const http = require('http');
const path = require("path");
const { Server } = require('socket.io'); 

const { jobmodel } = require("./models/login");
const { sjobmodel } = require("./models/add");
const { Application } = require("./models/apply");

class User {
    constructor(socketId, username) {
        this.socketId = socketId;
        this.username = username;
    }
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', 
    },
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

mongoose.connect("mongodb+srv://nithya:nithya913@cluster0.r7eo1il.mongodb.net/JobsDb?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

const generateHashedPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

let users = [];

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join', (username) => {
        const newUser = new User(socket.id, username); 
        users.push(newUser); 

        io.emit('userJoined', { username });
        console.log(`${username} has joined the chat.`);
    });

    socket.on('newMessage', (messageData) => {
        io.emit('message', messageData); 
        console.log('New message:', messageData);
    });

    socket.on('disconnect', () => {
        const user = users.find((user) => user.socketId === socket.id);
        if (user) {
            io.emit('userLeft', { username: user.username });
            users = users.filter((user) => user.socketId !== socket.id); 
            console.log(`${user.username} has left the chat.`);
        }
    });
});

app.post("/signin", async (req, res) => {
    try {
        const user = await jobmodel.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ status: "not exist" });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: "incorrect" });
        }

        const token = jwt.sign({ email: user.email }, "job-app", { expiresIn: "1d" });
        res.json({ status: "Success", userid: user._id, token });
    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({ status: "Error", message: "Internal server error" });
    }
});

app.post("/adminsignin", (req, res) => {
    const { email, password } = req.body;
    if (email === "admin" && password === "123") {
        return res.json({ status: "Success" });
    }
    res.status(401).json({ status: "Invalid credentials" });
});

app.post("/empsignin", (req, res) => {
    const { email, password } = req.body;
    if (email === "emp" && password === "123") {
        return res.json({ status: "Success" });
    }
    res.status(401).json({ status: "Invalid credentials" });
});

app.post("/signup", async (req, res) => {
    try {
        const hashedPassword = await generateHashedPassword(req.body.password);
        const newUser = new jobmodel({ ...req.body, password: hashedPassword });
        await newUser.save();
        res.json({ status: "Success" });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ status: "Error", message: "Internal server error" });
    }
});

app.post("/add", async (req, res) => {
    try {
        const newJob = new sjobmodel(req.body);
        await newJob.save();
        res.json({ status: "Success" });
    } catch (error) {
        console.error("Job addition error:", error);
        res.status(500).json({ status: "Error", message: "Internal server error" });
    }
});




app.get("/view", async (req, res) => {
    try {
        const jobs = await sjobmodel.find();
        res.json(jobs);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ status: "Error", message: "Internal server error" });
    }
});

app.post("/search", async (req, res) => {
    try {
        const jobs = await sjobmodel.find(req.body);
        res.json(jobs);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ status: "Error", message: "Internal server error" });
    }
});

app.post("/delete", async (req, res) => {
    try {
        await sjobmodel.findByIdAndDelete(req.body._id);
        res.json({ status: "Success" });
    } catch (error) {
        console.error("Error deleting job:", error);
        res.status(500).json({ status: "Error", message: "Internal server error" });
    }
});





app.get("/viewall", async (req, res) => {
    try {
        const prof = await jobmodel.find(); // Fetch all user records
        res.json(prof);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ status: "Error", message: "Internal server error" });
    }
});






server.listen(8080, () => {
    console.log("Server started on port 8080");
});
