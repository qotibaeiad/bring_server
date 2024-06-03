const Vonage = require('@vonage/server-sdk');

class VonageManager {
    constructor() {
        // Replace 'apiKey' and 'apiSecret' with your actual credentials
        this.apiKey = 'aaaddc62';
        this.apiSecret = 'PeHWSFYDXipZO7pJ';
        this.vonagePhoneNumber = 'Vonage APIs';

        // Do not create Vonage instance in the constructor
    }

    init() {
        this.client = new Vonage({
            apiKey: this.apiKey,
            apiSecret: this.apiSecret,
        });
    }

    sendMessage(toPhoneNumber, messageBody) {
        const from = this.vonagePhoneNumber;

        if (!this.client) {
            this.init();
        }

        this.client.message.sendSms(from, toPhoneNumber, messageBody, (err, responseData) => {
            if (err) {
                console.error('Error sending message:', err);
            } else {
                if (responseData.messages[0]['status'] === '0') {
                    console.log(`Message sent successfully. Message ID: ${responseData.messages[0]['message-id']}`);
                } else {
                    console.error(`Message failed with error: ${responseData.messages[0]['error-text']}`);
                }
            }
        });
    }
}

module.exports = VonageManager;