import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const ENDPOINT = "http://localhost:5000";

const useSocket = (user) => {
  const socket = useRef();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    socket.current = io(ENDPOINT);
    socket.current.emit("setup", user);
    socket.current.on("connected", () => setConnected(true));

    return () => {
      socket.current.disconnect();
    };
  }, [user]);

  return { socket: socket.current, connected };
};

export default useSocket;
