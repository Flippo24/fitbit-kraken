console.log("Companion up");

import { BalanceCalculator } from './BalanceCalculator.js';
import { KrakenClient } from './KrakenClient.js';
import { settingsStorage } from 'settings';

import * as messaging from 'messaging';

let currency = "ZEUR";
let key = "";
let secret = "";

let balanceQueue = 0;
let messageQueue = [];

messaging.peerSocket.onopen = function () {
}

messaging.peerSocket.onmessage = function (event) {
    if (event.data) {
        if (messageQueue.length > 0) {
            handleMessage()
        } else {
            messageQueue.push(event.data);
        }
    }
}

messaging.peerSocket.onerror = function (err) {
    console.log("Error: " + err.code + " - " + err.message);
}

function handleMessage() {
    var data = messageQueue[messageQueue.length - 1];
    console.log("Handling message");
    if (data.command) {
        switch (data.command) {
            case "balance":
                if (balanceQueue === 0) {
                    getBalance();
                }
                break;
            default:
                console.log("Unknown command");
                break;
        }
    }
}

function getBalance() {
    balanceQueue += 1;
    console.log("Getting balance");
    if (getSettings()) {
        sendData("message", "Right away!");
        let krakenClient = new KrakenClient(key, secret);
        let krakenCalc = new BalanceCalculator(krakenClient, currency);

        krakenCalc.getTotalBalance().then(balanceData => {
            sendData("balance", balanceData);
        }).catch(err => {
            console.log("Error: " + err);
            sendData("error", "I failed :( " + err);
        });
        balanceQueue -= 1;
    } else {
        sendData("message", "Sure, but set your API credentials in the app first!")
    }
}

function sendData(command, data = null) {
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        messaging.peerSocket.send({
            command: command,
            payload: data
        });
    }
    messageQueue.pop();
}

function getSettings() {
    if (settingsStorage.getItem('currency')) {
        currency = JSON.parse(settingsStorage.getItem('currency')).values[0].value;
    }

    if (settingsStorage.getItem('apiKey')) {
        key = JSON.parse(settingsStorage.getItem('apiKey')).name;
    }

    if (settingsStorage.getItem('apiSecret')) {
        secret = JSON.parse(settingsStorage.getItem('apiSecret')).name;
    }

    return (secret.length > 0 && key.length > 0);
}