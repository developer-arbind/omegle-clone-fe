import io from 'socket.io-client';


const socketInstance = io('http://localhost:8000');
socketInstance.connect();
export {
    socketInstance
}
