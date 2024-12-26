const { Vonage } = require('@vonage/server-sdk');

class VonageManager {
    constructor() {
        this.apiKey = process.env.VONAGE_API_KEY || 'aaaddc62'; // Replace with actual keys for production
        this.apiSecret = process.env.VONAGE_API_SECRET || 'PeHWSFYDXipZO7pJ';
        this.vonagePhoneNumber = process.env.VONAGE_PHONE_NUMBER || '+972123456789';
        this.client = null; // Initialize client as null
    }

    init() {
        if (!this.client) {
            this.client = new Vonage({
                apiKey: this.apiKey,
                apiSecret: this.apiSecret,
            });
            console.log('Vonage client initialized.');
        }
    }

    sendMessage(toPhoneNumber, messageBody) {
        console.log(`Preparing to send SMS to: ${toPhoneNumber}`); // Debugging
        if (!toPhoneNumber || !toPhoneNumber.startsWith('+')) {
            console.error('Invalid phone number format. Must include country code.');
            return;
        }

        this.init(); // Ensure client is initialized

        const from = this.vonagePhoneNumber;

        this.client.sms.send({ to: toPhoneNumber, from, text: messageBody })
            .then((responseData) => {
                const message = responseData.messages[0];
                if (message.status === '0') {
                    console.log(`Message sent successfully. Message ID: ${message['message-id']}`);
                } else {
                    console.error(`Message failed with error: ${message['error-text']}`);
                }
            })
            .catch((err) => {
                console.error('Error sending message:', err);
            });
    }
}

module.exports = VonageManager;
