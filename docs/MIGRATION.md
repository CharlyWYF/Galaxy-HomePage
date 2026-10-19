# 项目拆分记录

2026-10-19 已完成生产切换。

- HomePage：`https://www.charlyw.top`，仅部署 `public/` 中的星空主页、场景资源与内容配置。
- CharlyHub：`https://hub.charlyw.top`，私有仓库 `CharlyWYF/CharlyHub`，本地目录 `../CharlyHub`。
- 原主页基线提交：`9e31db19ba678ceaf2cd523a5fb51f464c5e5d7d`。
- 迁出 200 个原始文件，逐文件 SHA-256 校验一致。来源和路径见 CharlyHub 的 `migration-manifest.json`。

## 内容归属

| 内容 | 新源码位置 | Hub 地址 |
| --- | --- | --- |
| 计算器 | sites/tools/cal/ | /cal/ |
| Kingdom 与子工具 | sites/games/kingdom/ | /kingdom/ |
| 学习资料 | sites/notes/docs/ | /docs/ |
| 放映厅与视频 | sites/media/ | /flv/、/video/ |
| 下载页面与安装包 | sites/downloads/ | /downloads/、/apks/ |
| 订阅配置 | sites/network/sub/ | /sub/ |
| 共用样式和图标 | shared/ | /style.css、/icon/ |
| 旧版主页脚本 | archive/homepage-v1/ | 不部署 |

## 旧地址退役

迁移初期曾通过反向代理保留原主页的旧路径。按用户要求，这些转发已删除，原域名只保留星空主页。原 `/cal`、`/kingdom`、`/docs`、`/flv`、`/video`、`/downloads`、`/apks`、`/sub` 和旧共用资源入口不再提供内容，使用 Hub 的对应路径访问。

星空中的 6 个已迁移入口直接指向 Hub。独立部署的其他网站保留其原域名。星空自身的旧脚本、样式和字体路径别名仍保留，以兼容星空页面缓存。

旧路径配置脚本、迁移部署限制及对应测试已移除。两个项目独立更新和部署；历史文件仍可从各自 Git 历史恢复。

## 历史页面问题

迁移只调整结构，未重写子页面。原计算器保存版缺失 `_files` 附件、个别旧页面相对样式或图标路径不完整、外部 CDN 和媒体源可用性，保留为后续内容维护事项。

主页部署产物约 6.75 MiB，迁出内容约 48.36 MiB。以后主页更新不再重复部署迁出内容；已有 Vercel 历史部署不会因此自动删除。
