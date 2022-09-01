import express from "express";
import { json } from "express";
import cors from "cors";
import dotnev from "dotenv";
import { MongoClient } from "mongodb";
import dayjs from "dayjs";

dotnev.config();

// - express
const app = express();
app.use(cors());
app.use(json());
// - mongo
const mongoClient = new MongoClient(process.env.MONGO_URI);
let database;
mongoClient.connect(() => {
    database = mongoClient.db("driven");
});

app.get("/", (req, res) => {

    res.send("<h1>Api Batepapo UOL</h1>")


})

// - /participants
app.post("/participants", async (req, res) => {

    const { name } = req.body;

    if (!name) {
        res.sendStatus(422);
        return;
    }

    try {
        const checkName = await database.collection("participants").findOne({ name: name });
        // console.log(checkName)
        if (checkName) {
            res.sendStatus(409);
            return;
        }

        await database.collection("participants").insertOne({ name: name, lastStatus: Date.now() })
        await database.collection("messages").insertOne({ from: name, to: "Todos", text: "entra na sala...", type: "status", time: dayjs().format('HH:mm:ss') })
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }

    res.sendStatus(201);

})

app.get("/participants", async (req, res) => {

    try {
        const participants = await database.collection("participants").find().toArray();
        res.send(participants);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
  

})

// - /messages

app.post("/messages", (req, res) => {

    const { to, text, type } = req.body;
    const { from } = req.headers;

    // ver se precisa também validar type e from
    if (!to || !text || !type || !from) {
        res.sendStatus(422);
        return;
    }

    res.sendStatus(201);
})


app.get("/messages", (req, res) => {

    const { limit } = req.query;
    const { user: nome } = req.headers;

    res.status(200).send({ message: "get /messages incompleto" });

})

// - /status

app.get("/status", (req, res) => {

    const { User: { nome } } = req.headers;

    console.log(nome);

    res.sendStatus(200);

})

app.listen(5000, () => console.log("Porta 5000"));
