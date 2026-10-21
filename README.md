# deepseek-cost

在 DeepSeek Harness 的输入框下方显示当前会话的人民币费用，点击费用即可查看当前模型的价目表。

价格按实际请求的 Token 用量计算，支持缓存命中 / 未命中 / 输出 Token 分档计价，并跟随当前模型自动切换价目表。首次运行没有本地价格缓存时，会自动从 DeepSeek 官方定价页抓取一次。

## 界面

费用显示在输入框下方的 Token 用量右侧：

```text
12.4K · 86% · ¥0.0412
                └── 点击打开模型价格
```

点击后显示：

- 当前模型名称
- 本会话累计费用
- 输入 Token：缓存命中 / 缓存未命中
- 输出 Token
- 空闲时段 / 高峰时段单价
- 「更新价格」按钮

## 功能

- 人民币计费，直接使用 DeepSeek 官方人民币价格。
- 按每次成功请求的实际 usage 计费。
- 缓存命中、缓存未命中、缓存写入和输出 Token 分别计价。
- 切换模型后立即切换价目表。
- 点击费用打开当前模型的价格清单。
- 手动「更新价格」抓取官方最新价格。
- 首次运行无本地缓存时自动抓取官方价格。
- 价格保存到本地，DSH 重启后继续使用。
- 官方页面新增模型时自动解析；未收录的模型显示 `—`，不会套用错误价格。
- 官方调价只影响后续请求，不回溯重算历史费用。

## 环境要求

- DeepSeek Harness Web 或 Desktop，且当前 profile 启用了 Plugins 页面。
- 已安装插件管理器；大多数 Desktop / Web profile 默认具备。
- 首次自动更新和手动更新价格时需要能访问：
  - `https://api-docs.deepseek.com`
  - `https://github.com`（从 GitHub 安装时）
- 不需要 Node.js、pnpm、编译或构建步骤。

当前版本按 DSH `0.2.1-rc.2` 的插件 API 编写。其他 DSH 版本如果调整了 Client Slot 或 Host 服务接口，可能需要适配。

## 安装

### 方式一：从 GitHub 安装（推荐）

DSH 的 **Add plugin** 支持直接填写 Git 仓库地址。

1. 打开 DSH 侧边栏的 **Plugins（插件）**。
2. 点击 **Add plugin（添加插件）**。
3. 在输入框中填写：

   ```text
   https://github.com/Zeromixis/deepseek-cost
   ```

4. 点击 **Install（安装）**。
5. 勾选信任提示；第三方插件会以 Host 进程权限运行。
6. 安装完成后确认 **deepseek-cost** 处于启用状态。
7. 刷新页面。
8. 发起一次对话；输入框下方出现 `¥` 费用即安装成功。

### 方式二：从 Release 安装包安装

适合不想让插件管理器直接拉 Git 仓库的情况。

1. 下载 Release 安装包：

   ```text
   https://github.com/Zeromixis/deepseek-cost/releases/download/v1.5.1/deepseek-cost-1.5.1.tgz
   ```

2. 打开 **Plugins → Add plugin**。
3. 在输入框中填写上面这个 `.tgz` 的完整 URL。
4. 点击 **Install**，启用插件并刷新页面。

### 方式三：从本地 tarball 安装

适合把安装包用 U 盘或网盘带到另一台电脑。

1. 把 `deepseek-cost-1.5.1.tgz` 复制到目标电脑。
2. 打开 **Plugins → Add plugin**。
3. 填写 tarball 的**绝对路径**，例如：

   ```text
   C:\Users\你的用户名\Downloads\deepseek-cost-1.5.1.tgz
   ```

4. 点击 **Install**。
5. 启用插件，刷新页面。

注意：

- 必须填写完整绝对路径，不要使用 `~` 或相对路径。
- 路径中有空格时直接原样粘贴即可，不需要额外加引号。

### 方式四：从本地源码目录安装

适合开发或修改代码后直接加载。

1. 把仓库克隆或解压到本地。
2. 打开 **Plugins → Add plugin**。
3. 填写插件源码目录的绝对路径，例如：

   ```text
   C:\Users\你的用户名\deepseek-cost
   ```

4. 点击 **Install**。
5. 启用插件，刷新页面。

这种安装方式使用本地目录链接；修改源码后重新加载插件或重启 DSH 生效。

### 安装后的检查

1. **Plugins** 页面能看到 `deepseek-cost`。
2. 插件处于启用状态，Host 状态为 active。
3. 输入框下方 Token 用量右侧出现 `¥` 费用。
4. 点击费用能打开价格面板。
5. 第一次打开时如果正在自动抓取，会短暂显示「更新中…」。

如果安装成功但页面没有变化，先刷新页面；仍不显示时检查：

- 当前 profile 是否有 Plugins 页面。
- 插件是否被禁用。
- 是否已经至少完成过一次模型请求。
- DSH 版本是否与插件 API 兼容。

## 首次运行与价格缓存

首次运行且本地没有缓存时，插件会自动抓取一次官方价格。抓取成功后写入本地，后续启动直接读取缓存。

Windows 默认缓存位置：

```text
C:\Users\<用户名>\.dsh\profiles\<profile>\data\deepseek-cost\pricing.json
```

macOS / Linux：

```text
~/.dsh/profiles/<profile>/data/deepseek-cost/pricing.json
```

Desktop 默认 profile 通常是 `desktop`，所以 Windows 常见路径是：

```text
C:\Users\<用户名>\.dsh\profiles\desktop\data\deepseek-cost\pricing.json
```

缓存行为：

- 没有缓存 → 自动抓取官方价格。
- 有缓存 → 直接加载，不主动联网。
- 自动抓取失败 → 使用内置价格，不阻塞 DSH。
- 手动「更新价格」成功 → 覆盖本地缓存。
- 删除缓存文件 → 下次启动重新自动抓取。

价格缓存是每台机器独立的；但新机器首次运行会自动更新，不需要手动点按钮。

## 使用

1. 打开一个已有会话，或新建会话。
2. 完成至少一次模型请求。
3. 输入框下方出现 `¥` 费用。
4. 点击费用打开模型价目表。
5. 点击「更新价格」可随时抓取官方最新价格。

价格面板中的「本会话」是当前会话累计费用，不是账户余额，也不是最终账单。

### 高峰与空闲时段

DeepSeek 官方价格区分工作日高峰和空闲时段：

- 高峰：北京时间周一至周五 `09:00–12:00`、`14:00–18:00`
- 其他时间：空闲时段

插件按每次请求发生的时间选择对应单价。法定节假日未单独排除，估算结果可能和最终账单有少量差异。

## 价格来源与计算方式

价格来源：

```text
https://api-docs.deepseek.com/zh-cn/quick_start/pricing/
```

计算方式：

```text
费用 =
  缓存未命中输入 Token × 未命中单价
  + 缓存命中输入 Token × 命中单价
  + 缓存写入 Token × 写入单价
  + 输出 Token × 输出单价
```

所有单价均为人民币 / 百万 Token。

说明：

- 费用是估算值，不是最终账单。
- 官方调价只影响更新之后的新请求。
- 历史消息不会重新计费。
- 没有 usage 的请求不产生费用。
- 未收录模型会显示 `—`，不会使用其他模型的价格。

## 更新插件

第三方插件不会自动升级。更新步骤：

1. 在 **Plugins** 中打开 `deepseek-cost`。
2. 先 **Remove** 旧版本。
3. 用新的 GitHub 地址、tarball 或本地路径重新安装。
4. 启用并刷新页面。

价格缓存位于 profile 的 `data` 目录，卸载插件不会自动删除；重新安装后仍可继续使用。

## 卸载

在 **Plugins** 页面打开 `deepseek-cost`，点击 **Remove**。

如果需要同时删除价格缓存：

```text
C:\Users\<用户名>\.dsh\profiles\<profile>\data\deepseek-cost
```

## 常见问题

### 安装后没有显示费用

- 确认插件已启用。
- 刷新页面。
- 确认当前会话已经完成至少一次模型请求。
- 查看 Plugins 页面是否有 Host 状态错误。

### 费用显示 `—`

- 当前模型没有出现在价格表中。
- 或者模型请求没有返回可用的 usage。
- 点击「更新价格」后再试。

### 点击「更新价格」失败

- 确认 DSH Host 所在机器可以访问 `api-docs.deepseek.com`。
- 稍后重试。
- 如果官方页面结构变化，解析可能失败；此时继续使用已有缓存或内置价格。

### 显示 `cost.xxx` 这样的文字

这是旧版本的语言键问题。升级到当前版本并刷新页面即可。

### 切换模型后价格没变

当前版本会跟随 `model/selection` 事件立即切换。如果仍是旧模型价格：

- 确认安装的是最新版本。
- 刷新页面。
- 查看价格面板顶部的模型名称。

### 高峰价格和账单不一致

- 费用使用官方列表价估算，不是最终账单。
- 法定节假日、促销价、账户折扣等未计入。
- 官方调价后需要点一次「更新价格」。

## 目录结构

```text
deepseek-cost/
├── index.js            # Host：会话费用投影、自动/手动价格更新、缓存
├── cost.js             # 费用折叠、模型价格表、峰谷判断
├── pricing-source.js   # 官方定价页抓取解析
├── client.js           # Web 端费用按钮和价格面板
├── cordis.patch.yml    # DSH 插件入口
├── locale/             # 插件列表显示元数据
├── icon.svg
├── README.md
└── LICENSE
```

## 开发

本项目是纯 JavaScript 插件，不需要构建。

本地检查：

```bash
node --check index.js
node --check cost.js
node --check pricing-source.js
node --check client.js
```

打包：

```bash
pnpm pack --pack-destination ../dist
```

发布新版本：

1. 修改 `package.json` 的 `version`。
2. 更新 README 中的版本号和 Release 链接。
3. 提交并推送。
4. 在 GitHub 创建对应 tag 和 Release。
5. 上传 `.tgz` 安装包。

## License

MIT
