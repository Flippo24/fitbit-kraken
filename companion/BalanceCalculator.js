import { KrakenClient } from './KrakenClient.js';
import { settingsStorage } from 'settings';

console.log("Balance Calculator up");

export class BalanceCalculator {
    constructor(service, key) {
        this.currency = JSON.parse(settingsStorage.getItem('currency')).values[0].value || "ZEUR";

        var key = JSON.parse(settingsStorage.getItem('apiKey')).name;
        var secret = JSON.parse(settingsStorage.getItem('apiSecret')).name;

        this.data = {};
        this.pairlist = [];
        this.total = 0.0;
        this.api = null;

        switch (service) {
            case "kraken":
                this.api = new KrakenClient(key, secret);
                break;
            default:
                throw new Error("Unknown service");
        }
    }

    setCurrency(currency) {
        this.currency = "Z" + currency.toUppercase();
    }

    getTotalBalance() {
        return new Promise((resolve, reject) => {
            this.getBalances().then(_ => {
                this.getRates().then(_ => {
                    this.computeTotal();
                    resolve({
                        balance: Math.round(this.total),
                        currency: this.currency.slice(-3)
                    });
                }).catch(err => {
                    reject(err);
                });
            }).catch(err => {
                reject(err);
            });
        })
    }

    getBalances() {
        return this.api.privateMethod("Balance").then(data => {
            Object.keys(data.result).forEach(b => {
                if (parseFloat(b) != 0) {
                    var pair = b + this.currency.slice(-b.length);
                    this.data[b] = {
                        balance: parseFloat(data.result[b]),
                        pair: pair
                    }
                }

                if (b !== this.currency) {
                    this.pairlist.push(pair);
                }
            })
        });
    }

    getRates() {
        var payload = { pair: this.pairlist.join(",") };
        return this.api.publicMethod("Ticker", payload).then(data => {
            var prices = data.result;
            Object.keys(this.data).forEach(asset => {
                var item = this.data[asset];
                if (asset == this.currency) {
                    item.rate = 1;
                } else {
                    item.rate = parseFloat(prices[item.pair].a[0]);
                }
            })
        });
    }

    computeTotal() {
        this.total = 0;
        Object.keys(this.data).forEach(asset => {
            var item = this.data[asset];

            var inHomeCurrency = item.balance * item.rate;
            item.total = inHomeCurrency;
            this.total += inHomeCurrency;
        });
    }
}