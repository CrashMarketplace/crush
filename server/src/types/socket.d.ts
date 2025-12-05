import "socket.io";

declare module "socket.io" {
  interface SocketData {
    user?: {
      id: string;
      userId: string;
      email: string;
    };
  }
}

