# QQQ ETF 实时监控系统

一个用于实时监控纳斯达克100指数基金(QQQ)价格变化的Web应用，具备可视化图表展示和微信推送报警功能。

## 功能特性

- 实时显示QQQ ETF价格和变化情况
- 可视化图表展示历史价格趋势
- 当价格涨跌超过设定阈值时，通过微信推送报警
- 响应式设计，支持移动端浏览
- 可自定义报警阈值和刷新频率

## 技术栈

- 前端: HTML5, CSS3, JavaScript, Chart.js
- 后端: Node.js, Express
- 数据源: Alpha Vantage API
- 微信推送: Server酱

## 安装与运行

### 1. 克隆项目
```bash
git clone <repository-url>
cd QQQ
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
1. 重命名 `.env.example` 为 `.env`
2. 在 `.env` 文件中填入你的 Alpha Vantage API Key

### 4. 获取API Key
1. 访问 [Alpha Vantage](https://www.alphavantage.co/support/#api-key) 获取免费API Key
2. 访问 [Server酱](https://sct.ftqq.com/) 获取微信推送Key

### 5. 启动应用
```bash
npm start
```

访问 `http://localhost:3000` 查看应用

## 使用说明

1. 打开应用后，系统会自动获取QQQ实时价格数据
2. 在设置面板中配置：
   - 报警阈值：价格变化超过该百分比时触发报警
   - Server酱Key：用于微信推送的密钥
   - 刷新间隔：数据更新频率
3. 当QQQ价格变化超过设定阈值时，系统会自动发送微信推送

## 项目结构

```
QQQ/
├── index.html          # 主页面
├── style.css           # 样式文件
├── script.js           # 前端逻辑
├── server.js           # 后端服务
├── package.json        # 项目依赖
├── .env               # 环境变量配置
└── README.md          # 项目说明
```

## 注意事项

1. Alpha Vantage免费API有速率限制（每分钟5次请求）
2. 为避免超过API限制，建议将刷新间隔设置为60秒或更长
3. 微信推送功能需要在Server酱网站注册并获取推送Key

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。欢迎添加qq进行交流：821517836

## 许可证

MIT License