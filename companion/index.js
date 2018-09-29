console.log("Companion up");

import { BalanceCalculator } from './BalanceCalculator.js';
import * as messaging from 'messaging';

let calc = new BalanceCalculator("kraken");

messaging.peerSocket.onopen = function () {

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
                getBalance();
                break;
            default:
                console.log("Unknown command");
                break;
        }
    }
}

function getBalance() {
    if (calc.isReady()) {
        sendData("message", "Right away!");
        calc.getTotalBalance().then(balanceData => {
            sendData("balance", balanceData);
        }).catch(err => {
            console.log(err);
            sendData("message", "I failed :(");
        });
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
}