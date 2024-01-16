import io from 'socket.io-client';


const socketInstance = io('https://omegle-clone-backend.onrender.com');
socketInstance.connect();
export {
    socketInstance
}
