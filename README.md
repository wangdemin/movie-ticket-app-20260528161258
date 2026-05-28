# 星光影院 - 在线购买电影票前端页面

## 技术栈

- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- Bootstrap Icons

## 功能说明

- 顶部导航：首页、正在热映、即将上映、我的订单、个人中心
- 搜索框：按电影名称搜索
- 类型筛选：可按科幻、冒险、纪录片、悬疑、犯罪等类型筛选电影
- 电影列表：海报、电影名称、类型、上映时间、评分、简介、选座购票按钮
- 选座购票：影院选择、场次选择、座位图、座位选中/取消、票价与总价实时计算
- 结算弹窗：展示电影、影院、场次、座位、总金额，支持提交订单
- 我的订单：使用 localStorage 保存历史购票记录

## 使用方法

直接打开 `index.html` 即可运行。

也可以在目录中启动本地静态服务：

```bash
python3 -m http.server 8080
```

然后访问：

```text
http://localhost:8080
```

## 文件结构

```text
movie-ticket-app/
├── index.html
├── styles.css
├── app.js
└── README.md
```
