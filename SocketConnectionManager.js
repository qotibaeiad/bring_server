class SocketConnectionManager {
    constructor(io, mongoDBManager, twilioManager) {
        this.io = io;
        this.mongoDBManager = mongoDBManager;
        this.twilioManager = twilioManager;

        this.io.on('connection', this.handleConnection.bind(this));
    }

    handleConnection(socket) {
        const clientId = this.generateUniqueId();
        console.log(`Client connected with ID ${clientId}`);

        socket.on('streamitem', this.streamItems.bind(this, socket));

        socket.on('phonenumber', this.handlePhoneNumber.bind(this, socket, clientId));

        // Handle other socket events...

        socket.on('disconnect', () => {
            console.log(`Client with ID ${clientId} disconnected`);
        });
    }

    async streamItems(socket) {
        try {
            const items = await this.mongoDBManager.getItems();
            items.forEach(item => {
                socket.emit('streamitems', item);
                console.log(`Item emitted: ${item.category}, ${item.desc}`);
            });
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    }

    handlePhoneNumber(socket, clientId, phoneNumberData) {
        const randomFourDigitNumber = Math.floor(1000 + Math.random() * 9000).toString();
        console.log(`Received phone number of client with id ${clientId}:`, phoneNumberData);
        this.twilioManager.sendMessage(phoneNumberData, randomFourDigitNumber);
    }

    generateUniqueId() {
        return Math.random().toString(36).substr(2, 9);
    }
}

module.exports = SocketConnectionManager;
