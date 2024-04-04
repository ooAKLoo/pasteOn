
---

# 打包Electron应用指南

本指南介绍了如何为Windows和macOS平台打包Electron应用的步骤。

## 准备工作

确保您的开发环境已经安装了Node.js、npm以及所有项目依赖。特别是，项目应该已经添加了`electron`和`electron-builder`。

## 打包步骤

### 1. 构建前端资源

如果您的项目中包含前端资源（如使用React、Vue等），首先需要构建这些资源：

```bash
npm run build
```

这将根据您的项目配置（如Vite、Webpack等）构建项目，并生成用于打包的静态资源(本项目在vite中配置的build输出dist文件夹)。

### 2. 打包应用

使用`electron-builder`打包您的应用。您可以选择针对所有平台打包，或者仅针对特定平台：

- **为所有平台打包**

  ```bash
  npm run dist
  ```

- **仅为Windows打包**

  ```bash
  npm run dist -- -w
  ```

- **仅为macOS打包**

  ```bash
  npm run dist -- -m
  ```

### 3. 测试未打包的应用（可选）

使用`pack`命令可以生成未打包的版本，这对于快速测试应用而不创建完整的安装程序很有用：

```bash
npm run pack
```

这将在`dist`文件夹中生成应用的未打包版本。

## 发布应用

在`dist`文件夹准备好之后，您可以选择将安装程序压缩后上传到GitHub Releases或其他软件发布平台。通常，您只需要上传：

- 对于Windows：`.exe`安装程序及相关的更新元数据文件（如`latest.yml`）。
- 对于macOS：`.dmg`或`.pkg`安装包及相关的更新元数据文件。

## 版本控制和标签

为每个发布的版本打上Git标签，使用应用的版本号作为标签名：

```bash
git tag -a v<版本号> -m "Release <版本号>"
git push origin v<版本号>
```

将压缩包上传到GitHub Releases、npm或其他软件发布平台。如果是GitHub，你可以在创建新Release时，将此ZIP包作为资产附件上传。

## 注意事项

- 打包macOS应用通常需要在macOS系统上进行，以满足Apple的签名要求。
- 确保您的`package.json`中已正确配置了`electron-builder`，包括应用ID、图标等。

---
 asar extract app.asar ./
