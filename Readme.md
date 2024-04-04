
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
- 对于macOS：`.dmg`或`.zip`安装包及相关的更新元数据文件。

pasteOn-24.4.4.dmg：这是一个磁盘映像文件，通常用于分发macOS应用程序。用户下载后可以挂载这个磁盘映像，然后将应用程序拖动到他们的应用程序文件夹中。这是向最终用户分发macOS应用程序的常用方法。

pasteOn-24.4.4-mac.zip：这是一个压缩文件，包含了应用程序。一些分发渠道可能更喜欢使用ZIP文件，因为它们可以被直接解压缩，而不需要像DMG文件那样被挂载。

另外，icons目录下的图标文件（icon.icns、icon.ico、macAppIcon.png）是为了支持不同的操作系统而准备的应用图标。这些文件在打包过程中已经被使用，通常不需要单独分发给用户。

最后，assets目录包含的资源可能是你的应用在运行时需要的静态文件。这些文件应该已经包含在你的应用程序包（pasteOn.app）中了，所以无需单独分发。

## 版本控制和标签

为每个发布的版本打上Git标签，使用应用的版本号作为标签名：

```bash
git tag -a v<版本号> -m "Release <版本号>"
git push origin v<版本号>
```

将压缩包上传到GitHub Releases、npm或其他软件发布平台。如果是GitHub，你可以在创建新Release时，将此ZIP包作为资产附件上传。

## 其他常用命令

```bash
 asar extract app.asar ./

(base) yangdongju@localhost pasteOn % export PATH="$(npm config get prefix)/bin:$PATH"
(base) yangdongju@localhost pasteOn %  pkg --version        
5.8.1
(base) yangdongju@localhost pasteOn % npm run build-server
```

## 注意事项

- 打包macOS应用通常需要在macOS系统上进行，以满足Apple的签名要求。
- 确保您的`package.json`中已正确配置了`electron-builder`，包括应用ID、图标等。

## 转载说明和商业用途限制

本项目的文档和代码采用[GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.en.html)授权发布。任何人都可以按照AGPL v3的条款来使用和分发本项目的代码，但是必须同样以AGPL v3的条款来分发修改后的版本，并且必须明确标注原作者和来源。

**禁止商业用途**：未经原作者书面同意，不得将本项目的内容和代码用于商业目的。对于希望使用本项目内容或代码的商业实体，请直接联系项目维护者以获取授权。

---
