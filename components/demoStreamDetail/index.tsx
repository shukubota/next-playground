import {useDraw, userList} from "../../hooks/useDraw";

function DemoStreamDetail() {
  const {
    stream: currentStream,
    connectStream,
    disconnectStream,
    cRef,
    startDrawing,
    stopDrawing,
    draw,
    onChangeUser,
    onAutoDraw,
    user,
  } = useDraw();

  return (
    <div style={{ marginLeft: 10 }}>
      <h2>
        クライアント{user}
      </h2>
      <button onClick={connectStream} style={{ width: 100, padding: 10 }}>
        接続
      </button>
      <button onClick={disconnectStream} style={{ width: 100, padding: 10, marginLeft: 10 }}>
        接続終了
      </button>
      <button onClick={onAutoDraw} style={{ width: 100, padding: 10, marginLeft: 10 }}>
        自動描画
      </button>
      <p>grpcサーバと接続しているか: {String(currentStream !== null)}</p>
      <p style={{ marginTop: 40 }}>UserID(色名=UserID)</p>
      <select
        onChange={onChangeUser}
        defaultValue={userList[0]}
        style={{ width: 100, height: 40 }}
      >
        {userList.map((color: string) => {
          return (
            <option key={color} value={color}>
              {color}
            </option>
          );
        })}
      </select>
      <div style={{ marginTop: 20 }}>
        <canvas
          style={{ backgroundColor: "white" }}
          ref={cRef}
          width="400"
          height="400"
          onMouseMove={draw}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
        />
      </div>
    </div>
  );
}

export default DemoStreamDetail;