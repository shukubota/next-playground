"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var vertexai_1 = require("@google-cloud/vertexai");
var fs = require("node:fs");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var projectId, location, vertexAI, imagePath, imageData, base64Image, model, prompt, response, candidate, _i, _a, part;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    projectId = process.env.GOOGLE_CLOUD_PROJECT || "your-project-id";
                    location = "us-central1";
                    vertexAI = new vertexai_1.VertexAI({
                        project: projectId,
                        location: location,
                    });
                    imagePath = "/Users/shu.kubota/Desktop/banner_original.png";
                    imageData = fs.readFileSync(imagePath);
                    base64Image = imageData.toString("base64");
                    model = vertexAI.getGenerativeModel({
                        model: "gemini-1.5-pro-vision-001",
                    });
                    prompt = [
                        {
                            text: "Create a picture of my cat eating a nano-banana in a fancy restaurant under the Gemini constellation"
                        },
                        {
                            inlineData: {
                                mimeType: "image/png",
                                data: base64Image,
                            },
                        },
                    ];
                    return [4 /*yield*/, model.generateContent({
                            contents: [{ role: "user", parts: prompt }],
                        })];
                case 1:
                    response = _b.sent();
                    console.log("Response:", JSON.stringify(response, null, 2));
                    if (response.response && response.response.candidates) {
                        candidate = response.response.candidates[0];
                        if (candidate.content && candidate.content.parts) {
                            for (_i = 0, _a = candidate.content.parts; _i < _a.length; _i++) {
                                part = _a[_i];
                                if (part.text) {
                                    console.log("Generated text:", part.text);
                                }
                            }
                        }
                    }
                    else {
                        console.log("Full response structure:", response);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error);
