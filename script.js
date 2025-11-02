// 全局变量
let chart = null;
let currentPrice = 0;
let previousPrice = 0;
let alertThreshold = 1; // 默认1%阈值
let serverChanKey = ''; // Server酱推送key
let refreshInterval = 60000; // 默认60秒刷新一次
let isConnected = false;

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化图表
    initChart();

    // 绑定事件
    document.getElementById('settings-form').addEventListener('submit', saveSettings);
    document.getElementById('test-alert').addEventListener('click', testAlert);

    // 加载保存的设置
    loadSettings();

    // 开始获取数据
    fetchData();

    // 设置定时刷新
    setInterval(fetchData, refreshInterval);
});

// 初始化图表
function initChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'QQQ Price',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// 获取数据
async function fetchData() {
    try {
        // 模拟数据获取 - 在实际应用中，这里应该调用后端API
        // const response = await fetch('/api/qqq-price');
        // const data = await response.json();

        // 生成模拟数据用于演示
        const mockData = generateMockData();
        updateUI(mockData);
        isConnected = true;
        updateConnectionStatus();
    } catch (error) {
        console.error('获取数据失败:', error);
        isConnected = false;
        updateConnectionStatus();
    }
}

// 生成模拟数据
function generateMockData() {
    const now = new Date();
    const basePrice = previousPrice || 400 + Math.random() * 10; // 基准价格
    const change = (Math.random() - 0.5) * 2; // 随机变化
    const newPrice = basePrice + change;

    return {
        price: newPrice,
        change: change,
        changePercent: (change / basePrice) * 100,
        timestamp: now.toLocaleTimeString()
    };
}

// 更新UI
function updateUI(data) {
    previousPrice = currentPrice;
    currentPrice = data.price;

    // 更新价格显示
    document.getElementById('currentPrice').textContent = '$' + currentPrice.toFixed(2);
    document.getElementById('lastUpdated').textContent = 'Last updated: ' + data.timestamp;

    // 更新变化值
    const changeElement = document.getElementById('priceChange');
    const changePercentElement = document.getElementById('changePercent');

    changeElement.textContent = '$' + data.change.toFixed(2);
    changePercentElement.textContent = data.changePercent.toFixed(2) + '%';

    // 设置颜色和样式
    if (data.change >= 0) {
        changeElement.className = 'price-change-value positive';
        changePercentElement.className = 'change-percent positive';
    } else {
        changeElement.className = 'price-change-value negative';
        changePercentElement.className = 'change-percent negative';
    }

    // 检查是否需要报警
    checkAlert(data.changePercent);

    // 更新图表
    updateChart(data);
}

// 更新图表
function updateChart(data) {
    if (!chart) return;

    const now = new Date();
    const timeLabel = now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0');

    // 添加新数据点
    chart.data.labels.push(timeLabel);
    chart.data.datasets[0].data.push(data.price);

    // 保持最近30个数据点
    if (chart.data.labels.length > 30) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    chart.update();
}

// 检查报警条件
function checkAlert(changePercent) {
    const absChange = Math.abs(changePercent);
    const alertBadge = document.getElementById('alertBadge');

    if (absChange >= alertThreshold) {
        alertBadge.style.display = 'inline';

        // 发送微信推送
        if (serverChanKey) {
            sendWeChatAlert(changePercent);
        }
    } else {
        alertBadge.style.display = 'none';
    }
}

// 发送微信推送
async function sendWeChatAlert(changePercent) {
    try {
        // 在实际应用中，这里应该调用后端API发送推送
        // const response = await fetch('/api/send-alert', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         key: serverChanKey,
        //         title: `QQQ价格变化提醒`,
        //         content: `QQQ ETF价格变化 ${changePercent.toFixed(2)}%，当前价格 $${currentPrice.toFixed(2)}`
        //     })
        // });

        console.log(`发送微信推送: QQQ价格变化 ${changePercent.toFixed(2)}%`);
    } catch (error) {
        console.error('发送微信推送失败:', error);
    }
}

// 保存设置
function saveSettings(e) {
    e.preventDefault();

    alertThreshold = parseFloat(document.getElementById('alertThreshold').value) || 1;
    serverChanKey = document.getElementById('serverChanKey').value;
    refreshInterval = (parseInt(document.getElementById('refreshInterval').value) || 60) * 1000;

    // 保存到localStorage
    localStorage.setItem('qqqAlertThreshold', alertThreshold);
    localStorage.setItem('qqqServerChanKey', serverChanKey);
    localStorage.setItem('qqqRefreshInterval', refreshInterval);

    alert('设置已保存！');
}

// 加载设置
function loadSettings() {
    const savedThreshold = localStorage.getItem('qqqAlertThreshold');
    const savedKey = localStorage.getItem('qqqServerChanKey');
    const savedInterval = localStorage.getItem('qqqRefreshInterval');

    if (savedThreshold) {
        alertThreshold = parseFloat(savedThreshold);
        document.getElementById('alertThreshold').value = alertThreshold;
    }

    if (savedKey) {
        serverChanKey = savedKey;
        document.getElementById('serverChanKey').value = serverChanKey;
    }

    if (savedInterval) {
        refreshInterval = parseInt(savedInterval);
        document.getElementById('refreshInterval').value = refreshInterval / 1000;
    }
}

// 测试报警
function testAlert() {
    if (!serverChanKey) {
        alert('请先设置Server酱推送Key');
        return;
    }

    sendWeChatAlert(1.5);
    alert('测试推送已发送！');
}

// 更新连接状态
function updateConnectionStatus() {
    const statusElement = document.getElementById('connectionStatus');
    if (isConnected) {
        statusElement.innerHTML = '<span class="status-indicator status-connected"></span> Connected';
    } else {
        statusElement.innerHTML = '<span class="status-indicator status-disconnected"></span> Disconnected';
    }
}