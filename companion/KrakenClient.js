import { CryptoJS } from "./cryptoJS";

// Public/Private method names
const methods = {
    public: ['Time', 'Assets', 'AssetPairs', 'Ticker', 'Depth', 'Trades', 'Spread', 'OHLC'],
    private: ['Balance', 'TradeBalance', 'OpenOrders', 'ClosedOrders', 'QueryOrders', 'TradesHistory', 'QueryTrades', 'OpenPositions', 'Ledgers', 'QueryLedgers', 'TradeVolume', 'AddOrder', 'CancelOrder', 'DepositMethods', 'DepositAddresses', 'DepositStatus', 'WithdrawInfo', 'Withdraw', 'WithdrawStatus', 'WithdrawCancel'],
};

// Default options
const defaults = {
    url: 'https://api.kraken.com',
    version: 0,
    timeout: 5000,
};

// Create a signature for a request
const getMessageSignature = (path, request, secret, nonce) => {
    // API-Sign = Message signature using HMAC-SHA512 of (URI path + SHA256(nonce + POST data)) and base64 decoded secret API key
    // modified from Kraken-API code with love by Sander Van de Moortel
    const message = JSON.stringify(request);
    const hash = CryptoJS.SHA256(nonce + message);
    const secret_buffer = CryptoJS.enc.Base64.parse(secret);
    const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA512, secret_buffer);
    hmac.update(path, secret_buffer);
    hmac.update(hash, secret_buffer);
    return hmac.finalize().toString(CryptoJS.enc.Base64);
};

// Send an API request
const rawRequest = async (url, headers, data, timeout) => {
    // Set custom User-Agent string
    headers['User-Agent'] = 'Fitbit';
    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'application/json';

    const options = { headers, timeout };

    Object.assign(options, {
        method: 'POST',
        body: JSON.stringify(data)
    });

    const body = await fetch(url, options);
    const json = await body.text();
    const response = JSON.parse(json);

    if (response.error && response.error.length) {
        const error = response.error
            .filter((e) => e.startsWith('E'))
            .map((e) => e.substr(1));

        if (!error.length) {
            throw new Error("Kraken API returned an unknown error");
        }

        throw new Error(error.join(', '));
    }

    return response;
};

/**
 * KrakenClient connects to the Kraken.com API
 * @param {String}        key               API Key
 * @param {String}        secret            API Secret
 * @param {String|Object} [options={}]      Additional options. If a string is passed, will default to just setting `options.otp`.
 * @param {String}        [options.otp]     Two-factor password (optional) (also, doesn't work)
 * @param {Number}        [options.timeout] Maximum timeout (in milliseconds) for all API-calls (passed to `request`)
 */
export class KrakenClient {
    constructor(key, secret, options) {
        // Allow passing the OTP as the third argument for backwards compatibility
        if (typeof options === 'string') {
            options = { otp: options };
        }

        this.config = Object.assign({ key, secret }, defaults, options);
    }

	/**
	 * This method makes a public or private API request.
	 * @param  {String}   method   The API method (public or private)
	 * @param  {Object}   params   Arguments to pass to the api call
	 * @param  {Function} callback A callback function to be executed when the request is complete
	 * @return {Object}            The request object
	 */
    api(method, params, callback) {
        // Default params to empty object
        if (typeof params === 'function') {
            callback = params;
            params = {};
        }

        if (methods.public.includes(method)) {
            return this.publicMethod(method, params, callback);
        }
        else if (methods.private.includes(method)) {
            return this.privateMethod(method, params, callback);
        }
        else {
            throw new Error(method + ' is not a valid API method.');
        }
    }

	/**
	 * This method makes a public API request.
	 * @param  {String}   method   The API method (public or private)
	 * @param  {Object}   params   Arguments to pass to the api call
	 * @param  {Function} callback A callback function to be executed when the request is complete
	 * @return {Object}            The request object
	 */
    publicMethod(method, params, callback) {
        params = params || {};

        // Default params to empty object
        if (typeof params === 'function') {
            callback = params;
            params = {};
        }

        const path = '/' + this.config.version + '/public/' + method;
        const url = this.config.url + path;
        const response = rawRequest(url, {}, params, this.config.timeout);

        if (typeof callback === 'function') {
            response
                .then((result) => callback(null, result))
                .catch((error) => callback(error, null));
        }

        return response;
    }

	/**
	 * This method makes a private API request.
	 * @param  {String}   method   The API method (public or private)
	 * @param  {Object}   params   Arguments to pass to the api call
	 * @param  {Function} callback A callback function to be executed when the request is complete
	 * @return {Object}            The request object
	 */
    privateMethod(method, params, callback) {
        params = params || {};

        // Default params to empty object
        if (typeof params === 'function') {
            callback = params;
            params = {};
        }

        const path = '/' + this.config.version + '/private/' + method;
        const url = this.config.url + path;

        if (!params.nonce) {
            params.nonce = new Date() * 1000; // spoof microsecond
        }

        if (this.config.otp !== undefined) {
            params.otp = this.config.otp;
        }

        const signature = getMessageSignature(
            path,
            params,
            this.config.secret,
            params.nonce
        );

        const headers = {
            'API-Key': this.config.key,
            'API-Sign': signature,
        };

        const response = rawRequest(url, headers, params, this.config.timeout);

        if (typeof callback === 'function') {
            response
                .then((result) => callback(null, result))
                .catch((error) => callback(error, null));
        }
        return response;
    }
}
