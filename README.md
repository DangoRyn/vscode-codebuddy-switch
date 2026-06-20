# codebuddy-switch

> a vscode extension to switch codebuddy model presets from the status bar.

## why

vscode 版 codebuddy 的自定义模型通过 `~/.codebuddy/models.json` 配置，但该文件**只支持保留一个模型**。当你配置多个模型时，后写入的会覆盖前一个，导致无法在同一工作区内快速切换。

`codebuddy-switch` 在状态栏提供一键切换能力，让你在多个模型预设之间随时切换，也能一键回到 CodeBuddy 官方默认模型。

## features

- 状态栏显示当前模型，点击弹出切换菜单
- 模型配置从 `presets.json` 读取，与代码完全分离
- 支持任意 OpenAI 兼容 API
- 一键重置为 CodeBuddy 默认模型
- 修改 `presets.json` 后即时生效，无需重载

## install

### 1. 把项目放到 VSCode 扩展目录

```
~/.vscode/extensions/DangoRyn.codebuddy-switch-1.0.0/
```

### 2. 配置模型预设

```bash
cp presets.example.json presets.json
```

编辑 `presets.json`，替换 `apiKey` 为你自己的 Key，按需增删条目。

### 3. 重载 VSCode

`Ctrl+Shift+P` → `Reload Window`

## usage

右下角状态栏点击当前模型名称，弹出菜单选择目标模型立即切换。

首次使用 `presets.json` 为空时，点击状态栏会提示打开配置文件。

快捷键：
- `Ctrl+Shift+P` → `切换 CodeBuddy 模型`
- `Ctrl+Shift+P` → `重置为 CodeBuddy 默认模型`

## presets.json 格式

```json
[
  {
    "id": "my-model",
    "name": "My Model",
    "description": "200K / 8K",
    "detail": "api.example.com",
    "vendor": "Custom",
    "url": "https://api.example.com/v1/chat/completions",
    "apiKey": "YOUR_API_KEY",
    "maxInputTokens": 200000,
    "maxOutputTokens": 8192,
    "supportsToolCall": true,
    "supportsImages": false,
    "supportsReasoning": true
  }
]
```

| 字段 | 说明 |
|---|---|
| `id` | 模型唯一标识，不可重复，同时写入 `models.json` |
| `name` | 状态栏和菜单中的显示名称 |

参考 `presets.example.json` 获取完整示例。

## supported platforms

任何兼容 OpenAI Chat Completions API 的模型提供商。

## license

MIT
