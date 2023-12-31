基于您提供的项目信息，以下是一个适用于您的 Electron 应用 `pasteOn` 的 README 文件模板，其中包含了安装、运行、构建和打包等命令的说明：

```markdown
# pasteOn

pasteOn 是一个 Electron 应用，用于管理剪贴板历史。

## 安装

在克隆或下载此项目后，运行以下命令以安装依赖：

```bash
npm install
```

这将安装所有必要的依赖项。

## 开发

要在开发模式下运行此应用，请使用：

```bash
npm run dev
```

这将启动 `webpack` 以观察文件更改并自动重新编译。

## 运行应用

要启动 Electron 应用，请运行：

```bash
npm start
```

这将启动 `electron` 并加载应用的主窗口。

## 打包应用

要打包应用以在不同的平台上运行，请使用以下命令：

- 打包为当前平台的可执行文件：

  ```bash
  npm run pack
  ```

- 打包并创建适用于多个平台（macOS、Windows、Linux）的安装程序：

  ```bash
  npm run dist
  ```

这些命令将在 `dist/` 文件夹中生成相应的安装程序和打包文件。

## 注意事项

- 确保在打包应用之前设置正确的应用图标。
- 在将应用部署到生产环境之前，请确保进行充分测试。

## 许可证

此项目使用 ISC 许可证。

## 关键字

- Electron
- 剪贴板管理
- 跨平台应用
```