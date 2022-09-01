import express from "express";
import { json } from "express";
import cors from "cors";
import dotnev from "dotenv";
import { MongoClient } from "mongodb";

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
        const checkName = await database.collection("participants").findOne({ name: `${name}` });
        console.log("aqui"+ checkName);
        if (checkName) {
            res.sendStatus(409);
            return;
        }

    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }

    res.sendStatus(201);

})

app.get("/participants", (req, res) => {

    res.send({ message: "requisição incompleta" })

})

// - /messages

app.post("/messages", (req, res) => {

    const { to, text, type } = req.body;
    const { from } = req.headers;

    // ver se precisa também validar type e from
    if (!to || !text) {
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
