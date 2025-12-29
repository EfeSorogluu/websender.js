"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Websender: () => Websender,
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);

// src/libs/websender.ts
var net = __toESM(require("net"));
var crypto = __toESM(require("crypto"));
var Websender = class {
  constructor(config) {
    this.socket = null;
    this.host = config.host;
    this.password = config.password;
    this.port = config.port;
    this.timeout = config.timeout || 30;
  }
  async connect() {
    return new Promise((resolve) => {
      try {
        this.socket = net.createConnection({
          host: this.host,
          port: this.port,
          timeout: this.timeout * 1e3
        });
        this.socket.on("connect", async () => {
          try {
            this.writeRawByte(1);
            const challenge = await this.readRawInt();
            const hash = crypto.createHash("sha512").update(challenge.toString() + this.password).digest("hex");
            this.writeString(hash);
            const response = await this.readRawInt();
            resolve({
              success: response === 1
            });
          } catch (error) {
            console.error("[WebSenderJS] Authentication error:", error);
            resolve({
              success: false,
              error: error instanceof Error ? error.message : "Unknown error during authentication"
            });
          }
        });
        this.socket.on("error", (error) => {
          console.error("[WebSenderJS] Socket error:", error);
          let errorMessage = "Connection error";
          if (error.code === "ECONNREFUSED") {
            errorMessage = `Connection refused. Please check if:
                        1. The Minecraft server is running
                        2. The Websender plugin is installed
                        3. The port ${this.port} is correct
                        4. The server is not blocking connections`;
          } else if (error.code === "ETIMEDOUT") {
            errorMessage = "Connection timed out. The server might be down or unreachable";
          } else if (error.code === "ENOTFOUND") {
            errorMessage = `Could not resolve host ${this.host}. Please check if the hostname is correct`;
          }
          resolve({
            success: false,
            error: errorMessage
          });
        });
        this.socket.on("timeout", () => {
          console.error("[WebSenderJS] Connection timeout");
          resolve({
            success: false,
            error: "Connection timeout. The server might be down or unreachable"
          });
        });
      } catch (error) {
        console.error("[WebSenderJS] Connection setup error:", error);
        resolve({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error during connection setup"
        });
      }
    });
  }
  async sendCommand(command) {
    if (!this.socket) {
      return { success: false, error: "Not connected" };
    }
    try {
      this.writeRawByte(2);
      this.writeString(Buffer.from(command).toString("base64"));
      const response = await this.readRawInt();
      return { success: response === 1 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  async sendMessage(message) {
    if (!this.socket) {
      return { success: false, error: "Not connected" };
    }
    try {
      this.writeRawByte(4);
      this.writeString(Buffer.from(message).toString("base64"));
      const response = await this.readRawInt();
      return { success: response === 1 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  async disconnect() {
    if (!this.socket) {
      return { success: false, error: "Not connected" };
    }
    try {
      this.writeRawByte(3);
      this.socket.destroy();
      this.socket = null;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  writeRawInt(value) {
    if (!this.socket) return;
    const buffer = Buffer.alloc(4);
    buffer.writeInt32BE(value, 0);
    this.socket.write(buffer);
  }
  writeRawByte(byte) {
    if (!this.socket) return;
    const buffer = Buffer.alloc(1);
    buffer.writeUInt8(byte, 0);
    this.socket.write(buffer);
  }
  writeString(str) {
    if (!this.socket) return;
    const chars = str.split("");
    this.writeRawInt(chars.length);
    for (const char of chars) {
      const code = char.charCodeAt(0);
      this.writeRawByte(255 & code >> 8);
      this.writeRawByte(255 & code);
    }
  }
  readRawInt() {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Not connected"));
        return;
      }
      const readData = () => {
        const buffer = this.socket.read(4);
        if (buffer) {
          resolve(buffer.readInt32BE(0));
        } else {
          this.socket.once("readable", readData);
        }
      };
      readData();
    });
  }
  readRawByte() {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Not connected"));
        return;
      }
      const readData = () => {
        const buffer = this.socket.read(1);
        if (buffer) {
          resolve(buffer.readUInt8(0));
        } else {
          this.socket.once("readable", readData);
        }
      };
      readData();
    });
  }
};

// src/index.ts
var index_default = Websender;
console.log('Use "npm run test" to test the library.');
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Websender
});
//# sourceMappingURL=index.js.map