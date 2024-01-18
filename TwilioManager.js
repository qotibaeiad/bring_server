const twilio = require('twilio');

class TwilioManager {
    constructor() {
        // Replace 'accountSid' and 'authToken' with your actual credentials
        this.accountSid = 'ACd16ecac30c5367a9e3af753a3c63b0a3';
        this.authToken = '44e7a0f01dc720bdd70880f8382c2d04';
        this.twilioPhoneNumber = '+14055710130';

        this.client = twilio(this.accountSid, this.authToken);
    }

    sendMessage(toPhoneNumber, messageBody) {
        this.client.messages
            .create({
                from: this.twilioPhoneNumber,
                to: toPhoneNumber,
                body: messageBody.toString(),
            })
            .then(message => console.log(`Message sent successfully. SID: ${message.sid}`))
            .catch(error => console.error('Error sending message:', error));
    }
}

module.exports = TwilioManager;
