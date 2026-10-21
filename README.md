# deepseek-cost

在 DeepSeek Harness Web 输入框下方显示当前会话的费用估算，点击费用可查看当前模型的价目表。

## 功能

- 在 Token 用量右侧显示人民币费用，例如 `¥0.0412`。
- 费用按实际请求的 usage 计算，区分缓存命中、缓存未命中、缓存写入和输出 Token。
- 自动跟随当前模型，切换模型后立即更新价目表。
- 价格面板显示：
  - 当前模型和本会话累计费用
  - 缓存命中 / 未命中 / 输出单价
  - 空闲时段 / 高峰时段价格
- 首次运行且本地没有价格缓存时，会自动从 DeepSeek 官方中文定价页抓取一次并保存。
- 「更新价格」按钮可随时手动重新抓取，并保存到本地。
- 官方页面新增模型时，会一起解析；未收录的模型显示 `—`，不会套用错误价格。
- 官方调价只影响后续请求，不回溯重算历史费用。

## 安装

### 方式一：本地 tarball（推荐）

1. 把 `deepseek-cost-1.5.1.tgz` 复制到家里的电脑。
2. 打开 DSH Web，进入 **Plugins**。
3. 点击 **Add plugin**，在包名输入框中填写 tarball 的绝对路径，例如：
   ```text
   C:\Users\你的用户名\Downloads\deepseek-cost-1.5.1.tgz
   ```
4. 点击 **Install**，安装完成后确认插件已启用。
5. 刷新页面。首次运行会自动抓取一次价格，无需手动点「更新价格」。

也可以在 Creator 会话里让 Agent 直接安装该路径。

### 方式二：npm

包名可用时，发布到 npm：

```bash
npm publish
```

之后在 **Plugins → Add plugin** 中填写：

```text
deepseek-cost
```

### 方式三：Git 仓库

把 `plugins/deepseek-cost` 推送到 GitHub 后，在 Add plugin 中填写仓库地址即可。

## 使用

- 需要先有至少一次模型请求，费用才会出现。
- 点击费用打开模型价目表。
- 首次运行无缓存时会自动抓取官方价格。
- 也可以点击「更新价格」手动抓取官方最新价格。
- 抓取成功后写入本地缓存，DSH 重启后仍会加载。

Windows 默认缓存位置：

```text
C:\Users\<用户名>\.dsh\profiles\desktop\data\deepseek-cost\pricing.json
```

## 说明

- 价格来源：<https://api-docs.deepseek.com/zh-cn/quick_start/pricing/>
- 费用是估算值，不是最终账单。
- 抓取官方页面需要本机能够访问 `api-docs.deepseek.com`。
- 官方页面结构发生较大变化时，解析可能失败；此时保留上一次价格或内置价格。

## License

MIT
