import {FC, useCallback} from "react";
import {SendStream, useChat} from "../../hooks/useConnect";

type Props = {}

function DemoStreamDetail() {
  const {
    stream: currentStream,
    connectStream,
    disconnectStream,
    sendData,
  } = useChat();
  const onConnect = useCallback(() => {
    console.log("onConnect")
    connectStream();
  }, [currentStream]);

  const onDisconnect = useCallback(() => {
    console.log("onDisconnect")
    disconnectStream();
  }, [currentStream])

  const onSend = useCallback(async (data: string) => {
    const req: SendStream = { message: "hoge" }
    const res = await sendData(req)
    console.log(res)
  }, [])

  console.log("render-------------------")
  console.log({ currentStream })
  return (
    <>
      <div>
        <p>demo page stream</p>
      </div>
      <button onClick={onConnect} style={{ width: 100, padding: 10 }}>
        <p>接続</p>
      </button>
      <button onClick={onDisconnect} style={{ width: 100, padding: 10, marginLeft: 10 }}>
        <p>接続終了</p>
      </button>
      <p>接続しているか: {String(currentStream !== null)}</p>
      <div>
        <button onClick={() => onSend("hoge")} style={{ width: 100, padding: 10, marginLeft: 10 }}>
          <p>送信</p>
        </button>
      </div>
    </>
  );
}

export default DemoStreamDetail;