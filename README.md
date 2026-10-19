# 查理の星空 · HomePage 2.0

基于 Three.js 的个人星空主页，将网站导航呈现为可探索的三维星图。

[访问主页](https://www.charlyw.top)

## 功能

- 探索、游乐、知识三个星区，支持搜索和分类筛选。
- 桌面支持拖动、旋转、缩放和悬停详情；移动端支持触屏手势。
- 星球自转、卫星绕行、飞船跟随与进入过渡动画。
- 闲置自动环绕，页面进入后台或失去焦点时暂停渲染。
- 本地 Three.js 和字体资源。

## 本地运行

需要 Node.js 20+ 和 Python 3，无需安装第三方依赖。

```sh
npm run dev
```

打开 http://127.0.0.1:8000/ 。资源检查与测试分别使用 `npm run check`、`npm test`。

## 编辑与结构

- `public/content/galaxy-content.json`：网站、星球外观、位置、星区和连线。
- `public/assets/js/`：场景、飞船和手势逻辑。
- `public/assets/css/galaxy.css`：界面样式。
- `public/assets/vendor/`：Three.js 与字体。

详细配置见 [编辑指南](docs/EDITING.md)。修改脚本或样式后，同步更新 `public/index.html` 中的资源版本。

## 部署

推送 `main` 分支自动部署到 Vercel。构建命令为 `npm run build`，发布目录为 `public/`。

## 第三方许可

- Three.js：MIT，见 `public/assets/vendor/LICENSE`。
- Oxanium、Noto Sans SC：SIL OFL 1.1，许可证位于各自字体目录。
