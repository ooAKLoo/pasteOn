# README.md 用于 PasteOn Tauri 应用

这个 README 文件提供了使用 React, Vite, Tauri, Tailwind CSS 和 Rust 开发一个最小化桌面应用的全面指南。本文将引导您完成从环境配置到应用打包的整个过程。

## 项目设置

### 第一步：前端设置

在开始前，请确保您的开发环境已安装 Node.js 和 npm。

1. **创建项目目录并初始化 Node 项目：**
   ```bash
   mkdir pasteOn_tauri
   cd pasteOn_tauri
   npm init -y
   ```

2. **在项目中创建前端目录并安装 Vite 和 React：**
   ```bash
   npm create vite@latest src-front -- --template react
   cd src-front
   npm install
   ```

3. **安装 Tailwind CSS：**
   ```bash
   npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
   npx tailwindcss init -p
   ```
   在 `tailwind.config.js` 文件中配置 content 选项以包括你的 React 组件路径。

4. **在 `src/index.css` 中引入 Tailwind：**
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

5. **配置 Vite：**
   修改 `vite.config.js` 确保端口和 React 支持设置正确。

6. **创建一个简单的 React 组件：**
   编辑 `src/App.jsx`，展示 Tailwind CSS 的应用。

7. **运行 Vite 开发服务器测试：**
   ```bash
   npm run dev
   ```

### 第二步：集成 Tauri

1. **返回到项目根目录，初始化 Tauri：**
   ```bash
   cd ..
   npm init tauri-app
   ```
   在初始化过程中选择 Create a new Tauri integration 和默认 Rust 工具链。

2. **构建并运行 Tauri 应用：**
   ```bash
   cd src-tauri
   cargo tauri dev
   ```

通过以上步骤，你将成功创建一个基础的桌面应用，该应用结合了 React, Vite, Tauri, Tailwind CSS 和 Rust 的技术。这个过程展示了如何结合使用这些工具来开发现代桌面应用。每个工具都在其特定领域内发挥作用，从前端的快速开发到后端的安全性和性能。

## 打包和分发

- **打包应用**:
  在 `src-tauri` 目录下运行以下命令来构建项目并生成最终的可执行文件：
  ```bash
  cargo tauri build
  ```
  打包完成后，可执行文件和相关资源将被放置在 `src-tauri/target/release` 目录下的 `bundle` 文件夹内，适用于不同的操作系统平台。

#### 步骤 1: 安装 Tauri CLI

- **安装 Tauri CLI**:
  打开终端，并运行以下命令以安装 Tauri CLI 工具：
  ```bash
  cargo install tauri-cli --version ^1.0
  ```
  这个命令将全局安装 Tauri CLI，允许您通过 Cargo 直接调用。

#### 步骤 2: 确认项目结构

- **确认项目结构**:
  您需要在包含 `src-tauri` 目录的位置运行 `cargo tauri dev` 命令。通常，这应该是项目的根目录，而不是 `pasteOn_tauri` 内部。使用 `tree` 命令或文件资源管理器确认 `src-tauri` 目录确实在 `pasteOn_tauri` 内部。

  如果您在 `pasteOn_tauri` 目录中，需要回到它的父目录来运行 Tauri 命令：
  ```bash
  cd ..
  cargo tauri dev
  ```

#### 步骤 3: 修改打包配置

- **修正配置**:
  您应该将 `tauri.conf.json` 中的 `distDir` 修改为指向 `src-front` 下的构建输出目录。假设使用 Vite 默认的构建输出设置，则输出目录通常是 `src-front/dist`。因此，您需要更新配置如下：

  ```json
  "build": {
    "devPath": "http://localhost:5173",
    "distDir": "../../src-front/dist",
    "withGlobalTauri": true
  }
  ```

#### 步骤 4: 构建前端

- **构建前端项目**:
  确保您在 `src-front` 目录内，然后执行以下命令来构建前端项目：
  ```bash
  cd src-front
  npm run build
  ```
  这将在 `src-front/dist` 目录下生成静态文件。

#### 步骤 5: 打包 Tauri 应用

- **打包应用**:
  在完成前端构建后，返回到包含 `src-tauri` 的目录并执行 Tauri 的打包命令：
  ```bash
  cd ../pasteOn_tauri/src-tauri
  cargo tauri build
  // debug模式下打包
   cargo tauri build --debug 
  ```
  这将基于您的新配置和正确的前端构建输出来打包应用。

#### 步骤 6: 验证打包输出

- **检查输出**:
  打包完成后，可执行文件和相关资源将被放置在 `src-tauri/target/release` 目录下的 `bundle` 文件夹内。根据您的操作系统，您将找到适用的可执行文件或安装程序。

通过以上详细步骤，您将能够成功解决运行问题，并将您的 Tauri 应用打包成可执行程序。这些文件随后可以分发给用户，支持在不同操作系统上安装和运行。如果在执行这些步骤中遇到任何问题，请确保所有路径和命令均按照上述说明正确执行。