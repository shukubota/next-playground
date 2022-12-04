import {useCallback, useRef, useState, MouseEvent, ChangeEvent} from "react"
import {ClientReadableStream} from "grpc-web"
import {DrawingShareClient} from "../../protobuf/Drawing_shareServiceClientPb"
import {
  ConnectRequest,
  SendDrawingRequest,
  DotData,
  ConnectResponse,
  DisConnectRequest
} from "../../protobuf/drawing_share_pb"

const client = new DrawingShareClient("http://localhost:9000")

const wait = (ms: number) => new Promise((res) => {
  setTimeout(() => res(true), ms)
})

export const userList = [
  'green',
  'red',
  'yellow',
  'blue',
  'black',
  'orange',
]

export const useDraw = () => {
  const [stream, setStream] = useState<ClientReadableStream<ConnectResponse> | null>(null)
  const [user, setUser] = useState<string>(userList[0])
  const [isDrawing, setIsDrawing] = useState<boolean>(false)
  const cRef = useRef<HTMLCanvasElement | null>(null)

  const startDrawing = useCallback(() => {
    setIsDrawing(true)
  }, [])
  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
  }, [])
  const connectStream = () => {
    const req = new ConnectRequest()
    req.setUser(user)
    if (stream !== null) {
      return
    }
    const connection = client.connect(req)

    connection.on("data", (m: ConnectResponse) => {
      const data = m.getData()
      const x = data?.getX()
      const y = data?.getY()
      if (!x || !y) return
      _draw(x, y, m.getFrom())
    })

    connection.on("end", () => {
      connection.cancel()
      setStream(null)
    })
    setStream(connection)
  }

  const _draw = (x: number, y: number, user: string) => {
    const canvas = cRef.current
    const ctx = canvas!.getContext('2d')
    if (ctx == null) {
      return
    }
    ctx.beginPath()
    ctx.fillStyle = user
    ctx.arc(x, y, 10, 0, 2 * Math.PI)
    ctx.fill()
    ctx.closePath()
  }

  const onChangeUser = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setUser(e.target.value);
  }, [setUser])

  const disconnectStream = () => {
    if (stream) {
      const req = new DisConnectRequest()
      req.setUser(user)
      client.disConnect(req, null)
      stream.cancel()
      setStream(null)
    }
  }

  const draw = (e: MouseEvent) => {
    if (!isDrawing) return
    const {
      nativeEvent: {
        offsetX: x,
        offsetY: y,
      },
    } = e;
    return _sendData(x, y, user)
  }

  const _sendData = async (x: number, y: number, user: string) => {
    const req = new SendDrawingRequest()
    const d = new DotData()
    d.setX(x)
    d.setY(y)
    req.setData(d)
    req.setFrom(user)
    return client.sendDrawing(req, null)
  }

  const onAutoDraw = useCallback(async () => {
    let x = 0;
    let y = 0;
    for (let i = 0; i < 2000; i++) {
      await wait(30)

      const rx = Math.floor(Math.random() * 20) - 8
      const ry = Math.floor(Math.random() * 10)
      x = Math.max((x + rx) % 400, 0)
      y = Math.max((y + ry) % 400, 0)
      await _sendData(x, y, user)
    }
  }, [user]);

  return {
    stream,
    connectStream,
    disconnectStream,
    cRef,
    user,
    startDrawing,
    stopDrawing,
    isDrawing,
    draw,
    onChangeUser,
    onAutoDraw,
  };
}