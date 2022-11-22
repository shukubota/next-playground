// import { credentials, ServiceError } from "@grpc/grpc-js";
import {GreeterClient} from "../../protobuf/HelloServiceClientPb";
import {HelloRequest} from "../../protobuf/hello_pb";
import {useEffect} from "react";

export default function Demo() {
  useEffect( () => {
    console.log("demo-------------")
    // type '{ [index: string]: string; }'
    // const cred = credentials.createInsecure() as unknown as { [index: string]: string; }
    const client = new GreeterClient("http://localhost:9000");
    console.log({ client })
    const req = new HelloRequest();
    req.setName("hoge");
    // const res = client.sayHello(req, null, console.log);
    // console.log({res})
  }, [])
  return (
    <div>
      <p>demo page22</p>
    </div>
  )
}
