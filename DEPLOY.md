# FilmLab 部署

这是一个纯静态 PWA，不需要构建命令或服务器数据库。

本地局域网地址 `http://192.168.x.x:4173/` 只用于预览，不能安装 PWA。必须部署到 HTTPS 地址后，手机才会启用离线缓存和“安装到主屏幕”。

## 上传文件

将以下内容上传到任意支持 HTTPS 的静态网站托管：

- `index.html`
- `css/`
- `js/`
- `icons/`
- `vendor/`
- `manifest.webmanifest`
- `service-worker.js`
- `.nojekyll`，GitHub Pages 使用

不要上传 `server.js`、日志文件或本地预览截图。

## 推荐托管

### Cloudflare Pages

1. 创建 Pages 项目并选择直接上传。
2. 上传本项目目录。
3. 使用平台提供的 HTTPS 域名访问。
4. 手机浏览器打开后，从“更多”菜单选择“安装到手机”。

### GitHub Pages

1. 将本项目文件提交到 GitHub 仓库。
2. 在仓库 Settings > Pages 中选择从主分支根目录发布。
3. 使用生成的 HTTPS 地址访问。

## 数据说明

每个访客的冲洗记录和图片只保存在自己的浏览器中，不会上传到服务器，也不会在用户之间共享。更换域名、清理浏览器数据或卸载浏览器可能导致本地数据丢失，重要记录应定期使用应用内的“导出备份”。
