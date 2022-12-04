import * as jspb from 'google-protobuf'



export class ConnectRequest extends jspb.Message {
  getUser(): string;
  setUser(value: string): ConnectRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConnectRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ConnectRequest): ConnectRequest.AsObject;
  static serializeBinaryToWriter(message: ConnectRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConnectRequest;
  static deserializeBinaryFromReader(message: ConnectRequest, reader: jspb.BinaryReader): ConnectRequest;
}

export namespace ConnectRequest {
  export type AsObject = {
    user: string,
  }
}

export class ConnectResponse extends jspb.Message {
  getFrom(): string;
  setFrom(value: string): ConnectResponse;

  getData(): DotData | undefined;
  setData(value?: DotData): ConnectResponse;
  hasData(): boolean;
  clearData(): ConnectResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConnectResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ConnectResponse): ConnectResponse.AsObject;
  static serializeBinaryToWriter(message: ConnectResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConnectResponse;
  static deserializeBinaryFromReader(message: ConnectResponse, reader: jspb.BinaryReader): ConnectResponse;
}

export namespace ConnectResponse {
  export type AsObject = {
    from: string,
    data?: DotData.AsObject,
  }
}

export class DisConnectRequest extends jspb.Message {
  getUser(): string;
  setUser(value: string): DisConnectRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DisConnectRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DisConnectRequest): DisConnectRequest.AsObject;
  static serializeBinaryToWriter(message: DisConnectRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DisConnectRequest;
  static deserializeBinaryFromReader(message: DisConnectRequest, reader: jspb.BinaryReader): DisConnectRequest;
}

export namespace DisConnectRequest {
  export type AsObject = {
    user: string,
  }
}

export class DisConnectResponse extends jspb.Message {
  getStatus(): string;
  setStatus(value: string): DisConnectResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DisConnectResponse.AsObject;
  static toObject(includeInstance: boolean, msg: DisConnectResponse): DisConnectResponse.AsObject;
  static serializeBinaryToWriter(message: DisConnectResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DisConnectResponse;
  static deserializeBinaryFromReader(message: DisConnectResponse, reader: jspb.BinaryReader): DisConnectResponse;
}

export namespace DisConnectResponse {
  export type AsObject = {
    status: string,
  }
}

export class SendDrawingRequest extends jspb.Message {
  getData(): DotData | undefined;
  setData(value?: DotData): SendDrawingRequest;
  hasData(): boolean;
  clearData(): SendDrawingRequest;

  getFrom(): string;
  setFrom(value: string): SendDrawingRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendDrawingRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SendDrawingRequest): SendDrawingRequest.AsObject;
  static serializeBinaryToWriter(message: SendDrawingRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendDrawingRequest;
  static deserializeBinaryFromReader(message: SendDrawingRequest, reader: jspb.BinaryReader): SendDrawingRequest;
}

export namespace SendDrawingRequest {
  export type AsObject = {
    data?: DotData.AsObject,
    from: string,
  }
}

export class DotData extends jspb.Message {
  getX(): number;
  setX(value: number): DotData;

  getY(): number;
  setY(value: number): DotData;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DotData.AsObject;
  static toObject(includeInstance: boolean, msg: DotData): DotData.AsObject;
  static serializeBinaryToWriter(message: DotData, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DotData;
  static deserializeBinaryFromReader(message: DotData, reader: jspb.BinaryReader): DotData;
}

export namespace DotData {
  export type AsObject = {
    x: number,
    y: number,
  }
}

export class SendDrawingResponse extends jspb.Message {
  getStatus(): string;
  setStatus(value: string): SendDrawingResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendDrawingResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SendDrawingResponse): SendDrawingResponse.AsObject;
  static serializeBinaryToWriter(message: SendDrawingResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendDrawingResponse;
  static deserializeBinaryFromReader(message: SendDrawingResponse, reader: jspb.BinaryReader): SendDrawingResponse;
}

export namespace SendDrawingResponse {
  export type AsObject = {
    status: string,
  }
}

