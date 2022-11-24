import {GreeterClient} from "../../protobuf/HelloServiceClientPb";
import {HelloReply, HelloRequest} from "../../protobuf/hello_pb";
import {useState} from "react";
import {ClientReadableStream} from "grpc-web";
import {ChatClient} from "../../protobuf/ChatServiceClientPb";
import {ChatConnectRequest, ChatConnectResponse, ChatSendDataRequest} from "../../protobuf/chat_pb";

const client = new ChatClient("http://localhost:9000");

export interface SendStream {
  message: string;
}

export const useChat = () => {
  const [stream, setStream] = useState<ClientReadableStream<ChatConnectResponse> | null>(null);
  const connectStream = () => {
    const req = new ChatConnectRequest();
    req.setToken("user1");
    if (stream !== null) {
      return;
    }
    const st = client.connect(req);

    st.on("data", m => {
      console.log(m.getStatus());
      console.log("stream on -==============")
    })
    setStream(st)
  }

  const disconnectStream = () => {
    console.log({ stream })
    if (stream) {
      stream.cancel();
      setStream(null);
    }
  }

  const sendData = async (data: SendStream) => {
    const req = new ChatSendDataRequest();
    req.setData("data")
    req.setFrom("user1")
    const res = await client.sendData(req, null)
    console.log({ res })
    return res;
  }

  return {
    stream,
    connectStream,
    disconnectStream,
    sendData,
  };
}