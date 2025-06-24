const express = require('express');
const socket = require('socket.io');
const http = require('http');
const { Chess } = require("chess.js"); // ✅ Destructure correctly
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socket(server); // ✅ Socket.IO initialized

const chess = new Chess(); // ✅ Instance created
let players = {};
let currentPlayer = "w";

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public'))); // ✅ Static assets

app.get('/', (req, res) => {
    res.render("index", {title:"Chess Game"});
});
io.on("connection", function(uniquesocket){
     console.log("connected")
     //shoing connected and showing the activites we are doing on the page
     //uniquesocket.on("ch", function(){
       // console.log("ch r")
     //})
     //  console.log("disconnect")
     //})
     if (!players.white){
         players.white = uniquesocket.id;
         uniquesocket.emit("playerRole", "w");
        }else if (!players.black){
            players.black=uniquesocket.id;
            uniquesocket.emit("playerRole", "b");
        }else{
            uniquesocket.emit("spectatorRole");
        }
        uniquesocket.on("disconnect",function(){
            if(uniquesocket.id ===players.white){
                delete players.white;
            }else if(uniquesocket.id===players.black){
                delete players.black;
            }
            })
            uniquesocket.on("move",(move)=>{
                try{
                    if (chess.turn()==="w" && uniquesocket.id!==players.white) return;
                    if (chess.turn()==="b" && uniquesocket.id!==players.black) return;
                // checking move if correct 
                    const result= chess.move(move)
                    if(result){
                        currentPlayer= chess.turn();
                        io.emit("move",move);
                        io.emit("boardState",chess.fen())
                    }else{
                 console.log("invalid move", move)
                 uniquesocket.emit("invalidmove", move)
                    }
                }catch(err){
                    console.log(err);
                    uniquesocket.emit("invalidmove:", move);
                }
            })
})
server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});

