console.log("Watch app up");

import * as messaging from 'messaging';
import document from 'document';
import { MessageService } from './MessageService.js';

let messageService = new MessageService();


messageService.setTarget(document.getElementById("output"));
messageService.say("Hey phone")

messaging.peerSocket.onopen = function () {
    messageService.add("- Yes?")
    messageService.add("Can I get my Kraken balance?");
    sendCommand("balance");
}

messaging.peerSocket.onmessage = function (event) {
    handleMessage(event.data);
}

messaging.peerSocket.onerror = function (err) {
    console.log("Error: " + err.code + " - " + err.message);
}

function fetchAgain() {
    document.getElementById("output").onclick = null;
    messageService.say("Hey phone.. again?")
    sendCommand("balance");
}


function sendCommand(command, payload = null) {
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        messaging.peerSocket.send({
            command: command,
            payload: payload
        });
    }
}

function handleMessage(data) {
    if (!data.command) {
        messageService.say("Not sure what my Companion wants.");
    } else {
        switch (data.command) {
            case "message":
                messageService.add("- " + data.payload);
                break;
            case "balance":
                messageService.add("- " + data.payload.balance + " " + data.payload.currency);
                document.getElementById("output").onclick = (_) => fetchAgain();
                // messaging.peerSocket.close();
                break;
            default:
                messageService.add("I don't know what that means buddy.");
        }
    }
}