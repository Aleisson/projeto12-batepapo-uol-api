import express from "express";
import { json } from "express";
import cors from "cors";
import dotnev from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import dayjs from "dayjs";
import Joi from 'joi';


dotnev.config();

// - express
const app = express();
app.use(cors());
app.use(json());
// - mongo
const mongoClient = new MongoClient(process.env.MONGO_URI);
let database;
mongoClient.connect( () => {
    database = mongoClient.db("driven");
});




// - validação

const participantSchema = Joi.object({
    name: Joi.string().required()
})
const messageSchema = Joi.object({
    to: Joi.string().required(),
    text: Joi.string().required(),
    type: Joi.string().valid('message', 'private_message').required()

})

app.get("/", (req, res) => {

    res.send("<h1>Api Batepapo UOL</h1>")


})

// - /participants

app.post("/participants", async (req, res) => {


    // se tiver desconstruido
    const valida = participantSchema.validate(req.body);

    if (valida.error) {
        res.sendStatus(422);
        return;
    }

    const { name } = req.body;

    try {
        const checkName = await database.collection("participants").findOne({ name });
        //console.log(checkName);
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

app.post("/messages", async (req, res) => {

    const { from } = req.headers;


    const valida = messageSchema.validate(req.body)

    // ver se precisa também validar type e from
    if (valida.error) {
        valida.error.details.map(x => console.log(x.message));

        res.sendStatus(422);
        return;
    }



    const { to, text, type } = req.body;

    try {
        const checkName = await database.collection("participants").findOne({ name: from });
        //console.log("checkname:" + checkName);
        if (!checkName) {
            res.sendStatus(422);
            return;
        }


        await database.collection("messages").insertOne({ from, to, text, type, time: dayjs().format("HH:mm:ss") })
        res.sendStatus(201);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }




})


app.get("/messages", async (req, res) => {

    const { limit } = req.query;
    const { user } = req.headers;
    console.log(user);
    try {
        //filtrar aqui
        const messages = await database.collection("messages").find().toArray();

        const messagesFiltradas = [...messages].filter(message => message.to === "Todos" || message.to === user || message.from === user).reverse()

        if (limit) {
            res.status(200).send(messagesFiltradas.splice(0, limit).reverse());
            return;
        }

        res.status(200).send(messagesFiltradas.slice(0, 100).reverse());

    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }



})

// - /status

app.post("/status", async (req, res) => {

    const { user } = req.headers;
    //console.log(user)
    try {
        const userStatus = await database.collection("participants").findOne({ name: user});
        //console.log(userStatus);

        if (!userStatus) {
            res.sendStatus(404);
            return;
        }

        await database.collection("participants").updateOne({_id: userStatus._id},{$set:{lastStatus: Date.now()}})

    } catch (error) {

    }

    res.sendStatus(200);

})

// - functions

async function testStatus(participant){
    try {
        if((Date.now() - participant.lastStatus) > 15000){
            await database.collection('participants').deleteOne({_id: ObjectId(participant._id)})
            await database.collection("messages").insertOne({ from: participant.name, to: "Todos", text: "sai na sala...", type: "status", time: dayjs().format('HH:mm:ss') })
        }
    
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
 
}


async function removeParticipants(){

    

    try {
        const participants = await database.collection("participants").find().toArray();
        console.log(participants);
        participants.forEach(participant => testStatus(participant));
        console.log("aqui")
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }

   

}

// setInterval(removeParticipants(), 15000);


app.listen(5000, () => console.log("Porta 5000"));
