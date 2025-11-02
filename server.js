const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Alpha Vantage API配置
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'YOUR_API_KEY';
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

// Server酱推送配置
const SERVER_CHAN_URL = 'https://sctapi.ftqq.com/';

// 存储最新价格数据
let latestQQQData = {
    price: 0,
    change: 0,
    changePercent: 0,
    timestamp: new Date()
};

// 获取QQQ实时价格
async function getQQQPrice() {
    try {
        // 注意：Alpha Vantage免费版有速率限制（每分钟5次）
        const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
            params: {
                function: 'TIME_SERIES_INTRADAY',
                symbol: 'QQQ',
                interval: '1min',
                apikey: ALPHA_VANTAGE_API_KEY
            }
        });

        const data = response.data;

        // 解析数据
        if (data['Time Series (1min)']) {
            const timeSeries = data['Time Series (1min)'];
            const latestTime = Object.keys(timeSeries)[0];
            const latestData = timeSeries[latestTime];

            const currentPrice = parseFloat(latestData['4. close']);
            // 这里简化处理，实际应该与前一个价格比较计算变化

            latestQQQData = {
                price: currentPrice,
                change: 0, // 需要实际计算
                changePercent: 0, // 需要实际计算
                timestamp: new Date(latestTime)
            };

            return latestQQQData;
        } else {
            throw new Error('无法解析股票数据');
        }
    } catch (error) {
        console.error('获取QQQ价格失败:', error.message);
        // 返回模拟数据以便测试
        return generateMockData();
    }
}

// 生成模拟数据
function generateMockData() {
    const now = new Date();
    const basePrice = latestQQQData.price || 400 + Math.random() * 10;
    const change = (Math.random() - 0.5) * 2;
    const newPrice = basePrice + change;
    const changePercent = (change / basePrice) * 100;

    return {
        price: newPrice,
        change: change,
        changePercent: changePercent,
        timestamp: now
    };
}

// 发送微信推送
async function sendWeChatAlert(key, title, content) {
    try {
        const response = await axios.post(`${SERVER_CHAN_URL}${key}.send`, {
            title: title,
            desp: content
        });

        return response.data;
    } catch (error) {
        console.error('发送微信推送失败:', error.message);
        throw error;
    }
}

// API路由

// 获取QQQ价格
app.get('/api/qqq-price', async (req, res) => {
    try {
        const data = await getQQQPrice();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: '获取数据失败' });
    }
});

// 发送报警推送
app.post('/api/send-alert', async (req, res) => {
    try {
        const { key, title, content } = req.body;

        if (!key || !title || !content) {
            return res.status(400).json({ error: '缺少必要参数' });
        }

        const result = await sendWeChatAlert(key, title, content);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: '发送推送失败' });
    }
});

// 测试接口
app.get('/api/test', (req, res) => {
    res.json({ message: 'QQQ监控服务运行正常', timestamp: new Date() });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`QQQ监控服务运行在端口 ${PORT}`);
    console.log(`访问 http://localhost:${PORT} 查看监控页面`);
});

module.exports = app;