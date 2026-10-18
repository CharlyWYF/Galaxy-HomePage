# 项目拆分与上线切换

## 当前状态

- 基线：HomePage `9e31db19ba678ceaf2cd523a5fb51f464c5e5d7d`。
- 主页整理在本地分支 `refactor/project-split`，未更新生产分支。
- 独立内容项目位于桌面 `CharlyHub`，私有仓库 https://github.com/CharlyWYF/CharlyHub 已创建并推送；已连接 Vercel 项目 `charlyhub`；`hub.charlyw.top` 已绑定，等待 DNS 配置与线上验证。
- 迁出 200 个原始文件，逐文件 SHA-256 校验一致；详见新项目 `migration-manifest.json`。
- 主页只部署 `public/`。旧笔记、游戏、影音、下载和历史脚本不再进入主页产物。

## 内容归属

| 内容 | 所属项目与位置 |
| --- | --- |
| 星空入口、场景、手势、飞船 | HomePage/public/assets/ |
| 网站和星球配置 | HomePage/public/content/galaxy-content.json |
| 字体、Three.js、首页图标 | HomePage/public/assets/ |
| cal | CharlyHub/sites/tools/cal/ |
| kingdom 及其子工具 | CharlyHub/sites/games/kingdom/ |
| docs 下的所有学习资料 | CharlyHub/sites/notes/docs/ |
| flv、video | CharlyHub/sites/media/ |
| downloads、apks | CharlyHub/sites/downloads/ |
| sub | CharlyHub/sites/network/ |
| 旧版共用样式和图标 | CharlyHub/shared/ |
| 原根目录 config.js、data.js、script.js | CharlyHub/archive/homepage-v1/，不部署 |

新项目按用途组织源码，由 `site-catalog.json` 映射回原来的 URL 结构。构建不会重写原文件字节，因此已有页面内部链接、带中文和空格的资源名均得到保留。

图标复制到两个项目中，以保持各自独立。没有把 Vercel 团队、账户或部署凭据复制到新项目。

## 上线顺序

1. 确定新项目的 GitHub 仓库名、可见性和部署地址。
2. 将 CharlyHub 推到新仓库，在 Vercel 独立部署。构建 `node scripts/build.mjs`，输出 `dist`；配置已提供。
3. 检查新地址的 `/kingdom/`、嵌套游戏、`/flv/`、`/docs/ydtx/`、PDF、Notion 导出图片、下载及原始资源。
4. 回到 HomePage，运行 `node scripts/configure-legacy.mjs https://新项目固定域名`。目标必须与主页域名不同，避免代理循环。
5. 运行 `npm run check`、`npm test`、`npm run build`。
6. 审阅 `vercel.json` 的反向代理规则，再合并迁移分支到 main 并发布。
7. 用旧的 www.charlyw.top 路径确认仍能访问迁出的页面，再按需要逐步把星球 URL 改成新域名。

反向代理覆盖 `/cal`、`/kingdom`、`/docs`、`/flv`、`/video`、`/downloads`、`/apks`、`/sub`、旧共用样式和图标，包括根入口及子路径。搜索参数由平台正常转发。旧版星空脚本、样式、内容 JSON 和 vendor 入口也保留本地路径别名，减少切换期间旧缓存的影响。Vercel 文档：https://vercel.com/docs/routing/rewrites 。

`migration-config.json` 中新地址为空时，生产构建会失败；本地预览和检查仍可运行。这个阻止条件只用于保证迁移顺序，不需要发布一个临时失效版本。

## 校验范围与历史问题

- HomePage：本地 CSS/字体/模块/JSON 引用、内容和连线、后台暂停/恢复逻辑。
- CharlyHub：200 个文件完整性、构建映射、全部登记入口和部署输出。
- 历史页面仍保留原行为；没有在结构迁移中顺带重写它们。原计算器引用的 `_files` 附件缺失、部分旧页面的样式/图标相对路径、外部 CDN 或媒体源的可用性，属于后续逐页清理范围。
- 已有 Git 历史保留在 HomePage 仓库。新项目是独立历史，清单记录来源提交和原路径；本次不重写或强推旧仓库历史。

## 回退

上线前，main 和线上均未改变，可切回 main 恢复原结构。上线后如遇问题，回滚 HomePage 到迁移前版本，原页面仍包含在旧部署中；新项目可保留，不必同步删除。

每个项目今后按自己的内容更新分别部署，主页微调不再反复复制约 48 MiB 的迁出内容。缩减的是未来部署产物，已有 Vercel 历史部署的存储不会因这次源码整理立刻消失。

## 2026-10-19 接入进展

- 新项目本地目录已更名为 `../CharlyHub`。
- GitHub 仓库已创建为私有并上传完整内容。
- 主页的兼容转发已配置到 `https://hub.charlyw.top`，本地构建与检查通过。
- Vercel 项目 `charlyhub` 已创建并连接 GitHub 自动部署，域名已绑定。Cloudflare 需要添加 `hub` CNAME 到 `cf68ae1dcd23c27c.vercel-dns-017.com`（仅 DNS）。
- 等待新站 DNS 与 HTTPS、迁移路径验证通过，因此没有合并或推送主页生产分支。
