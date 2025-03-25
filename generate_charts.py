import yfinance as yf
import pandas as pd
import numpy as np
import talib
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from datetime import datetime, timedelta

try:
    # 设置时间范围
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    
print("正在从币安下载BTC数据...")
# 获取K线数据
timeframe = '1d'  # 1天的K线
since = int(start_date.timestamp() * 1000)
ohlcv = exchange.fetch_ohlcv('BTC/USDT', timeframe, since=since, limit=1000)

if btc.empty:
        raise Exception("未能获取到BTC数据")
    
print("计算技术指标...")
    # 计算移动平均线
    btc['MA5'] = talib.SMA(close_prices, timeperiod=5)
    btc['MA10'] = talib.SMA(close_prices, timeperiod=10)
    btc['MA20'] = talib.SMA(close_prices, timeperiod=20)
    btc['MA60'] = talib.SMA(close_prices, timeperiod=60)
    
    # 数据预处理
    close_prices = np.array(btc['Close'])
    if len(close_prices) < 30:  # 确保有足够的数据点
        raise Exception("数据点不足，至少需要30个交易日数据")
        
    # 计算技术指标
    btc['RSI'] = talib.RSI(close_prices, timeperiod=14)  # 添加 timeperiod 参数
    macd, macdsignal, macdhist = talib.MACD(close_prices, 
                                           fastperiod=12, 
                                           slowperiod=26, 
                                           signalperiod=9)  # 添加必要的参数
    btc['MACD'] = macd
    btc['MACD_Signal'] = macdsignal
    btc['MACD_Hist'] = macdhist
    
    print("创建图表...")
    # 创建图表
    fig = make_subplots(rows=3, cols=1, 
                        shared_xaxes=True,
                        vertical_spacing=0.05,
                        row_heights=[0.5, 0.25, 0.25])

    # K线图
    fig.add_trace(go.Candlestick(x=btc.index,
                                open=btc['Open'],
                                high=btc['High'],
                                low=btc['Low'],
                                close=btc['Close'],
                                name='BTC/USD',
                                increasing_line_color='red',  # 上涨蜡烛颜色
                                decreasing_line_color='green'),  # 下跌蜡烛颜色
                  row=1, col=1)

    # 添加移动平均线
    fig.add_trace(go.Scatter(x=btc.index, y=btc['MA5'], 
                            name='MA5', 
                            line=dict(color='yellow', width=1)),
                  row=1, col=1)
    fig.add_trace(go.Scatter(x=btc.index, y=btc['MA10'], 
                            name='MA10', 
                            line=dict(color='blue', width=1)),
                  row=1, col=1)
    fig.add_trace(go.Scatter(x=btc.index, y=btc['MA20'], 
                            name='MA20', 
                            line=dict(color='purple', width=1)),
                  row=1, col=1)
    fig.add_trace(go.Scatter(x=btc.index, y=btc['MA60'], 
                            name='MA60', 
                            line=dict(color='orange', width=1)),
                  row=1, col=1)

    # RSI指标
    fig.add_trace(go.Scatter(x=btc.index, y=btc['RSI'],
                            name='RSI',
                            line=dict(color='purple')),
                  row=2, col=1)

    # MACD指标
    fig.add_trace(go.Scatter(x=btc.index, y=btc['MACD'],
                            name='MACD',
                            line=dict(color='blue')),
                  row=3, col=1)
    fig.add_trace(go.Scatter(x=btc.index, y=btc['MACD_Signal'],
                            name='Signal',
                            line=dict(color='orange')),
                  row=3, col=1)
    fig.add_trace(go.Bar(x=btc.index, y=btc['MACD_Hist'],
                         name='Histogram'),
                  row=3, col=1)

    # 更新布局
    fig.update_layout(
        title='BTC/USD 技术分析',
        yaxis_title='价格 (USD)',
        yaxis2_title='RSI',
        yaxis3_title='MACD',
        xaxis_rangeslider_visible=False,
        height=800
    )

    print("保存图表...")
    # 保存为HTML文件
    fig.write_html('/Users/mike0xiansheng/Documents/trae-网站设计/charts.html')
    print("完成！")

except Exception as e:
    print(f"发生错误: {str(e)}")
    # 创建一个错误提示页面
    with open('/Users/mike0xiansheng/Documents/trae-网站设计/charts.html', 'w', encoding='utf-8') as f:
        f.write(f'''
        <html>
        <body>
            <h1>生成图表时发生错误</h1>
            <p>错误信息: {str(e)}</p>
            <p>请检查：</p>
            <ul>
                <li>网络连接是否正常</li>
                <li>是否已安装所有必要的Python库</li>
                <li>TA-Lib是否正确安装</li>
            </ul>
        </body>
        </html>
        ''')