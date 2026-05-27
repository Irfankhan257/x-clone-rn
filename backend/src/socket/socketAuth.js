import { verifyToken } from "@clerk/backend";

const socketAuth = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.query.token;

    console.log(socket.handshake.auth);

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    socket.user = {
      userId: payload.sub,
    };

    next();
  } catch (error) {
    console.log("Socket auth error:", error.message);

    next(new Error("Unauthorized"));
  }
};

export default socketAuth;