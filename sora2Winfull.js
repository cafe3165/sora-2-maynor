import dotenv from 'dotenv';
import Sora2 from "./sora2.js";
import axios from "axios";

dotenv.config();

class Sora2Winfull {


    constructor(apiKey = process.env.SORA_API_KEY_WINFULL, baseURL = process.env.SORA_BASE_URL_WINFULL) {
        this.apiKey = apiKey;
        this.baseURL = baseURL || 'https://api.winfull.cloud-ip.cc';
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 180000, // 3分钟超时
            validateStatus: (status) => status < 500 // 只重试5xx错误
        });
    }


    // 视频生成
    async generateVideoWinfull(prompt, options = {}) {


        try {

            console.log("generateVideoWinfull prompt:", JSON.stringify(prompt))
            console.log("generateVideoWinfull options:", JSON.stringify(options))
            const response = await this.client.post('/v1/video/create', {
                images: ["https://filesystem.site/cdn/20250612/998IGmUiM2koBGZM3UnZeImbPBNIUL.png"],
                prompt: prompt,
                size: "small",
                model: "sora-2-all",
                orientation: options.orientation || 'portrait', // landscape, portrait, square
                duration: options.duration || 15,
                ...options
            });
            response.data.channel = "winfull"
            console.log("generateVideoWinfull data:", JSON.stringify(response.data))
            return response.data;
        } catch (error) {
            console.log(JSON.stringify(error))
            throw new Error(`Video generation error: ${error.response?.data?.error?.message || error.message}`);
        }

    }


    // 查询视频任务状态
    async getVideoTaskWinfull(taskId) {
        try {
            // console.log("query taskId:", taskId);
            const response = await this.client.get(`/v1/video/query?id=${taskId}`);
            return response.data;
        } catch (error) {
            throw new Error(`Task query error: ${error.response?.data?.error?.message || error.message}`);
        }
    }
}

export default Sora2Winfull;
