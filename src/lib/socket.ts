import { io } from 'socket.io-client'

export const socket = io("https://wsbbj21c-3333.brs.devtunnels.ms/", {
    transports: ["websocket"], // Ensure the transport method matches
    autoConnect: false
});