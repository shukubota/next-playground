import {GreeterClient} from "../../protobuf/HelloServiceClientPb";
import {HelloReply, HelloRequest} from "../../protobuf/hello_pb";
import {useState} from "react";
import {ClientReadableStream} from "grpc-web";

const client = new GreeterClient("http://localhost:9000");

export const useConnect = () => {
  const [stream, setStream] = useState<ClientReadableStream<HelloReply> | null>(null);
  const connectStream = () => {
    const req = new HelloRequest();
    req.setName("hoge");
    const stream = client.sayHelloServerStream(req);

    console.log({stream})
    stream.on("data", m => {
      console.log(m.getMessage());
      console.log("stream on -==============")
    })
    console.log("00000")
    setStream(stream);
    console.log({stream});
  }

  const disconnectStream = () => {
    console.log({ stream })
    if (stream) {
      stream.cancel();
      setStream(null);
    }
  }

  return { stream, connectStream, disconnectStream };
}