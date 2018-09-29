console.log("Companion up");

import { BalanceCalculator } from './BalanceCalculator.js';
import * as messaging from 'messaging';

let calc = new BalanceCalculator("kraken");

messaging.peerSocket.onopen = function () {
    messaging.peerSocket.send({
        command: "hi"
    });
}

messaging.peerSocket.onmessage = function (event) {
    if (event.data) {
        handleMessage(event.data);
    }
}

messaging.peerSocket.onerror = function (err) {
    console.log("Error: " + err.code + " - " + err.message);
}

function handleMessage(data) {
    if (data.command) {
        switch (data.command) {
            case "balance":
                getBalance().then(balanceData => {
                    console.log("Giving my device what it wants");
                    sendData("balance", balanceData);
                });
                break;
            default:
                console.log("Unknown command");
                break;
        }
    }
}

function getBalance() {
    return calc.getTotalBalance();
}

function sendData(command, data = null) {
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        messaging.peerSocket.send({
            command: command,
            payload: data
        });
    }
}