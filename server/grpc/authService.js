import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const packageDef = protoLoader.loadSync("protos/auth.proto");
const authProto = grpc.loadPackageDefinition(packageDef).auth;

export const startAuthServer = () => {
  const server = new grpc.Server();
  server.addService(authProto.AuthService.service, {
    verifyToken: async (call, callback) => {
      try {
        const decoded = jwt.verify(call.request.token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: {
            id: decoded.id,
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        });
        if (!user) {
          return callback(null, { valid: false, error: "User not found" });
        }
        callback(null, {
          valid: true,
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        });

      } catch (error) {
        callback(null, { valid: false, error: error.message });
      }
    }
  });
  server.bindAsync(
    "127.0.0.1:50051",
    grpc.ServerCredentials.createInsecure(),
    () => {
      console.log("Auth gRPC server running on port 50051");
    }
  )
}