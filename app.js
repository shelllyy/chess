const express = require("express");
const socket = require("socket.io"); //real time connection
const http = require("http");
const {Chess} = require("chess.js"); // chess banane ki functionality
const path = require("path");

const app = express();
const server = http.createServer(app); //created a express server

const io = socket(server);// created a http server controlled by io

const chess= new Chess();

let players={};
let currentPlayer= "W";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res)=>{
    res.render("index", {title: "Chess Game"});
})

//setting up socket 
//whenever someone connects to our website, here uniquesocket is the info of the connected user
//socket io needs to be connected on both frontend andbackend in order to print connected  
io.on("connection", function(uniquesocket){
    console.log("connected");

//yahan pehla banda join hoga tab players object empty hota hoga toh 
//dekhega players empty hai tab white player aur white player = socket.id
// banega usk baad black player banega 
    if(!players.white){
        players.white= uniquesocket.id;
        uniquesocket.emit("playerRole", "w");//msg to tell player you are playing from white side
    }
    else if(!players.black){
        players.black= uniquesocket.id;
        uniquesocket.emit("playerRole", "b");
    }
    else{
        uniquesocket.emit("spectatorRole");
    }

    uniquesocket.on("disconnect", function(){ //koi khelta hua banda chordh dey
        if(uniquesocket.id=== players.white){
            delete players.white;
        }
        else if(uniquesocket.id===platers.black){
            delete players.black;
        }
    })
//to check if the move is valid or not
    uniquesocket.on("move", (move)=>{
        try{
            if(chess.turn()==="w" && uniquesocket.id!== players.white) return;//apni turn pr vahi insaan chalega 
            if(chess.turn()==="b" && uniquesocket.id!== players.black) return;

            const result = chess.move(move);//update the move on board
            if(result){//valid move hai 
                currentPlayer = chess.turn();//dusre ki baari
                io.emit("move", move);
                io.emit("boardState", chess.fen())//chess ki currentstate is send to f.e
            }
            else{
                console.log("Invalid Move");
                uniquesocket.emit("invalid", move);
            }
        }
        catch(err){
           console.log(err);
           uniquesocket.emit("invalid", move);

        }
    })
})

server.listen(3000, function(){
    console.log("Listening on port 3000");
});