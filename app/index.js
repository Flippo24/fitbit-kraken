import * as messaging from 'messaging';
import document from 'document';
import { MessageService } from './MessageService.js';

console.log("Watch app up");

let messageService = new MessageService();

messageService.setTarget(document.getElementById("output"));

messaging.peerSocket.onopen = function () {
    messageService.say("Contacting companion");
}

messaging.peerSocket.onmessage = function (event) {
    handleMessage(event.data);
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
            case "hi":
                messageService.say("We talkin'");
                sendCommand("balance");
                break;
            case "balance":
                messageService.say(data.payload.balance + " " + data.payload.currency);
                break;
            default:
                messageService.say("I don't know what that means buddy.");
        }
    }
}