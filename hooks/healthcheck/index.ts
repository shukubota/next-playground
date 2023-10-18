import {HelloRequest} from "../../protobuf/hello_pb";
import {GreeterClient} from "../../protobuf/HelloServiceClientPb";

const healthCheckClient = new GreeterClient("http://localhost:9000")
export const useHealthCheck = () => {
  const healthCheck = () => {
    const req = new HelloRequest();
    req.setName("test");

    return healthCheckClient.sayHello(req, null, (err, res) => {
      console.log(res)
      const message = res.getMessage()
      console.log({ message })
    });
  }

  return {
    healthCheck,
  }
}