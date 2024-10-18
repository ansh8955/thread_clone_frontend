import { createContext, useContext, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import io from "socket.io-client";
import userAtom from "../atoms/userAtom";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const user = useRecoilValue(userAtom);

  useEffect(() => {
    if (!user?._id) {
      console.warn(
        "User ID is not available. Socket connection will not be established."
      );
      return;
    }

    // Replace "/" with your backend URL if backend is hosted separately
    const socket = io("https://thread-backend-hgrz.onrender.com", {
      query: {
        userId: user._id,
      },
    });

    // Handle connection errors
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    setSocket(socket);

    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    // Clean up on component unmount
    return () => {
      if (socket) {
        socket.disconnect();
        console.log("Socket disconnected");
      }
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
