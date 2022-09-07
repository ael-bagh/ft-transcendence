import {io} from "socket.io-client";
const socket = io("ws://localhost:3010");

socket.on("hello", (arg)=>{
	console.log(arg);
});

socket.emit("howdy", "stranger");