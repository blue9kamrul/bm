import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const packageDef = protoLoader.loadSync("protos/auth.proto");
const authProto = grpc.loadPackageDefinition(packageDef).auth;

const client = new authProto.AuthService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

export const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    client.verifyToken({token}, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    })
  })
}