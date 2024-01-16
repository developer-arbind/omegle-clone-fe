import io from 'socket.io-client';


const socketInstance = io('https://omegle-clone-backend.vercel.app');
socketInstance.connect();
export {
    socketInstance
}
