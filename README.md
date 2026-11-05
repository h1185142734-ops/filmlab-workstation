# FilmLab

个人胶片冲洗工作台，用于记录冲洗批次、药水与设备、温度、步骤、计时和成片档案。

## 使用

这是一个无需构建的原生前端应用：

```powershell
node server.js
```

然后打开 `http://127.0.0.1:4173/`。

也可以直接将静态文件部署到支持 HTTPS 的静态托管平台。部署后可通过手机浏览器添加到主屏幕，作为 PWA 使用。

## 数据

- 每个使用者拥有独立的浏览器本地数据。
- 应用不包含多用户账号、中心服务器或共享数据库。
- 图片存放在浏览器 IndexedDB 中，记录和结构化数据存放在 localStorage 中。
- 清除浏览器数据、更换域名或卸载浏览器可能造成记录丢失，请定期导出备份。

## 文件

- `index.html`：页面结构
- `css/style.css`：界面样式与移动端适配
- `js/app.js`：应用逻辑
- `manifest.webmanifest`、`service-worker.js`：PWA 安装与离线缓存
- `vendor/chart.umd.min.js`：本地图表依赖
- `DEPLOY.md`：部署说明
