import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socketInstance) {
    const serverUrl = window.location.origin;
    socketInstance = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket.IO] Connected to real-time server:', socketInstance?.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.warn('[Socket.IO] Disconnected:', reason);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[Socket.IO] Connection error:', err.message);
    });
  }
  return socketInstance;
};

export const emitSocketUpload = (data: any) => {
  try {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('upload_item', data);
    }
  } catch (err) {
    console.warn('[Socket.IO] Emit upload error:', err);
  }
};

export const emitSocketDelete = (data: any) => {
  try {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('delete_item', data);
    }
  } catch (err) {
    console.warn('[Socket.IO] Emit delete error:', err);
  }
};

export const emitSocketPorboLink = (data: any) => {
  try {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('porbo_link_change', data);
    }
  } catch (err) {
    console.warn('[Socket.IO] Emit porbo link error:', err);
  }
};

export const emitSocketNotice = (data: any) => {
  try {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('notice_change', data);
    }
  } catch (err) {
    console.warn('[Socket.IO] Emit notice error:', err);
  }
};
