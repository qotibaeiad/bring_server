class SocketConnectionManager {
    constructor(io, mongoDBManager, vonageManager) {
        this.io = io;
        this.mongoDBManager = mongoDBManager;
        this.vonageManager = vonageManager;

        this.io.on('connection', this.handleConnection.bind(this));
    }

    handleConnection(socket) {
        const clientId = this.generateUniqueId();
        console.log(`Client connected with ID ${clientId}`);
        socket.on('streamitem', this.streamItems.bind(this, socket));
        socket.on('streamitemtopdown',this.streamtopItems.bind(this,socket));
        socket.on('stream5Staritem',this.stream5StarItems.bind(this,socket));
        socket.on('phonenumber', this.handlePhoneNumber.bind(this, socket, clientId));
        socket.on('disconnect', () => {
            console.log(`Client with ID ${clientId} disconnected`);
        });
    }

    async streamItems(socket) {
        try {
            const items = await this.mongoDBManager.getItemspopular();
            items.forEach(item => {
                socket.emit('streamitems', item);
                console.log(`Item emitted: ${item.category}, ${item.desc},${item.stars}`);
            });
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    }

    async streamtopItems(socket) {
        try {
            const items = await this.mongoDBManager.getItemstop();
            items.forEach(item => {
                socket.emit('streamtopdownitems', item);
                console.log(`Item emitted: ${item.category}, ${item.desc},${item.stars}`);
            });
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    }

    async stream5StarItems(socket) {
        try {
            const items = await this.mongoDBManager.get5starItems();
            items.forEach(item => {
                socket.emit('stream5staritems', item);
                console.log(`Item emitted: ${item.category}, ${item.desc},${item.stars}`);
            });
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    }

    

    handlePhoneNumber(socket, clientId, phoneNumberData) {
        const randomFourDigitNumber = Math.floor(1000 + Math.random() * 9000).toString();
        console.log(`Received phone number of client with id ${clientId}:`, phoneNumberData);
        this.vonageManager.sendMessage(phoneNumberData, randomFourDigitNumber);
    }

    generateUniqueId() {
        return Math.random().toString(36).substr(2, 9);
    }
}

module.exports = SocketConnectionManager;