import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {

    res.send("<h1>Api Batepapo UOL</h1>")


})

// - /participants
app.post("/participants", (req, res) =>{

    const {name} = req.body;

    if(!name){
        res.sendStatus(422);
    }

    res.sendStatus(201);

})


app.listen(5000, () => console.log("Rodando Porta 5000"));
