const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const os = require("os");

function getPresetsPath() {
  return path.join(__dirname, "presets.json");
}

function loadPresets() {
  try {
    const raw = fs.readFileSync(getPresetsPath(), "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function modelsJsonPath() {
  return path.join(os.homedir(), ".codebuddy", "models.json");
}

function currentModelId() {
  try {
    const raw = fs.readFileSync(modelsJsonPath(), "utf8");
    const data = JSON.parse(raw);
    return data.models && data.models.length ? data.models[0].id : null;
  } catch {
    return null;
  }
}

let statusBarItem;

function refreshStatusBar() {
  const presets = loadPresets();
  const cur = currentModelId();
  if (!cur) {
    statusBarItem.text = "$(symbol-color) CodeBuddy 默认";
    statusBarItem.tooltip = "当前: CodeBuddy 官方默认模型 | 点击切换";
    statusBarItem.backgroundColor = undefined;
    return;
  }
  const preset = presets.find((p) => p.id === cur);
  if (preset) {
    statusBarItem.text = `$(zap) ${preset.label}`;
    statusBarItem.tooltip = `当前: ${preset.label}\n${preset.description}\n点击切换`;
    statusBarItem.backgroundColor = new vscode.ThemeColor(
      "statusBarItem.warningBackground"
    );
  } else {
    statusBarItem.text = "$(symbol-color) 自定义模型";
    statusBarItem.tooltip = "当前: 自定义模型 | 点击切换";
  }
}

function writeModelsJson(preset) {
  const entry = {
    id: preset.id,
    name: preset.name,
    vendor: preset.vendor || "Custom",
    url: preset.url,
    apiKey: preset.apiKey,
  };
  for (const k of [
    "maxInputTokens",
    "maxOutputTokens",
    "supportsToolCall",
    "supportsImages",
    "supportsReasoning",
  ]) {
    if (preset[k] !== undefined) entry[k] = preset[k];
  }
  const p = modelsJsonPath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify({ models: [entry] }, null, 2), "utf8");
}

function resetModelsJson() {
  fs.writeFileSync(
    modelsJsonPath(),
    JSON.stringify({ models: [] }, null, 2),
    "utf8"
  );
}

function activate(context) {
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    99
  );
  statusBarItem.command = "modelSwitcher.pick";
  context.subscriptions.push(statusBarItem);
  refreshStatusBar();
  statusBarItem.show();

  context.subscriptions.push(
    vscode.commands.registerCommand("modelSwitcher.pick", async () => {
      const presets = loadPresets();
      if (presets.length === 0) {
        const action = await vscode.window.showInformationMessage(
          "presets.json 中没有配置模型。请先编辑 presets.json 添加模型预设。",
          "打开 presets.json",
          "查看示例"
        );
        if (action === "打开 presets.json") {
          const doc = await vscode.workspace.openTextDocument(getPresetsPath());
          await vscode.window.showTextDocument(doc);
        } else if (action === "查看示例") {
          const examplePath = path.join(__dirname, "presets.example.json");
          const doc = await vscode.workspace.openTextDocument(examplePath);
          await vscode.window.showTextDocument(doc);
        }
        return;
      }

      const items = presets.map((p) => ({
        label: p.label,
        description: p.description,
        detail: p.detail,
        preset: p,
      }));
      items.push({
        label: "$(arrow-left) 重置为 CodeBuddy 默认",
        description: "清空 models.json，恢复官方模型",
        detail: "",
        preset: null,
      });
      const picked = await vscode.window.showQuickPick(items, {
        placeHolder: "选择一个 CodeBuddy 模型预设...",
      });
      if (!picked) return;
      if (picked.preset === null) {
        resetModelsJson();
        vscode.window.showInformationMessage("已重置为 CodeBuddy 默认模型");
      } else {
        writeModelsJson(picked.preset);
        vscode.window.showInformationMessage(`已切换至: ${picked.label}`);
      }
      refreshStatusBar();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("modelSwitcher.resetToDefault", () => {
      resetModelsJson();
      refreshStatusBar();
      vscode.window.showInformationMessage("已重置为 CodeBuddy 默认模型");
    })
  );

  const watcher1 = vscode.workspace.createFileSystemWatcher(modelsJsonPath());
  watcher1.onDidChange(refreshStatusBar);
  watcher1.onDidCreate(refreshStatusBar);
  watcher1.onDidDelete(refreshStatusBar);
  context.subscriptions.push(watcher1);

  const watcher2 = vscode.workspace.createFileSystemWatcher(getPresetsPath());
  watcher2.onDidChange(refreshStatusBar);
  watcher2.onDidCreate(refreshStatusBar);
  context.subscriptions.push(watcher2);
}

function deactivate() {}

module.exports = { activate, deactivate };
