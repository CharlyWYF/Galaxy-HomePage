# 查理の星空 · HomePage 2.0

只负责三维星空主页和站点导航。工具、影音、游戏、资料及下载资源已在本地拆分到独立项目 `../charly-sites`；生产切换尚未执行。

## 项目结构

```text
public/                 唯一的部署目录
  index.html            主页入口
  content/
    galaxy-content.json 网站、星球、分类和连线配置
  assets/
    js/                 场景、飞船、手势和内容校验模块
    css/galaxy.css      界面样式
    vendor/             本地 Three.js 和字体，包含许可证
    icons/              主页图标
scripts/
  check.mjs             本地资源和部署前校验
  configure-legacy.mjs  配置迁出内容的旧路径兼容
tests/                 内容、连线和渲染生命周期检查
docs/
  EDITING.md            内容编辑指南
  MIGRATION.md          两个项目的迁移与切换说明
migration-config.json   旧路径和新项目目标域名
vercel.json             只发布 public/ 的 Vercel 配置
```

## 本地运行

需要 Node.js 20+；没有第三方工具依赖，不需要 npm install。

```sh
npm run check
npm test
npm run dev
```

访问 http://127.0.0.1:8000/ 。也可以运行 `python3 -m http.server 8000 --directory public`。不要直接双击 HTML；模块和 JSON 需要 HTTP 服务。

## 内容编辑

日常编辑 `public/content/galaxy-content.json`，无需修改场景代码。可配置网站名称、链接、介绍、星球位置/大小/颜色/装饰和分类。星区标签位于该区域各星球中心，自动连线只连接同星区内的星球。详见 [编辑指南](docs/EDITING.md)。

调整脚本或样式时，更新 `public/index.html` 中的资源版本；模块依赖也使用各自的查询版本。内容 JSON 每次加载会重新验证缓存，无需修改资源版本。

## 操作与动画

- 桌面：左键拖动、右键旋转、滚轮缩放，悬停查看信息，单击立即靠近，双击进入。
- 触屏：单指平移、双指缩放和旋转，轻点查看并靠近，双击放大；通过独立进入按钮跳转。
- 分类会按屏幕比例完整取景。方向键移动，+/- 缩放，Home 归位，/ 搜索，Escape 关闭信息。
- 飞船缓动跟随视角中心、朝目标飞行，移动时有轻量双引擎尾焰；星球自转、卫星绕行。
- 闲置 2 秒后缓慢自动环绕。页面隐藏或窗口失焦时停止渲染及 CSS 动画，恢复后不补算暂停时间；尊重系统减少动态效果偏好。

移动端星球名称基础字号 11px，缩放范围 0.55–1.25 倍；网址更小且在靠近时显示。星区标签最大 1 倍。桌面名称基础字号 16px，最大 1.9 倍。

英文和数字使用本地 Oxanium 可变字体，中文使用本地 Noto Sans SC 可变字体，当前界面优先使用小字包，新字按需加载分片。不依赖外部字体服务。

## 部署与迁移状态

Vercel 只部署 `public/`，构建命令为 `node scripts/check.mjs --deployment`。

**当前迁移分支不能直接发布。** 需先部署独立内容项目，再运行：

```sh
node scripts/configure-legacy.mjs https://NEW-SITES-DOMAIN
npm run build
```

这会为 `/docs`、`/kingdom`、`/flv` 等旧入口配置到新项目的反向代理，保留既有 URL。新地址未配置时，部署检查会主动失败，避免误发布后旧页面 404。详细顺序和回退方式见 [迁移说明](docs/MIGRATION.md)。

当前生产版本仍在 `main`；本地结构整理位于 `refactor/project-split`，尚未推送。

## 开源许可

- Three.js 0.180.0：MIT，见 `public/assets/vendor/LICENSE`。
- Oxanium：SIL OFL 1.1，见 `public/assets/vendor/fonts/oxanium/OFL.txt`。
- Noto Sans SC：SIL OFL 1.1，见 `public/assets/vendor/fonts/noto-sans-sc/OFL.txt`。字体来源见同目录 README。
