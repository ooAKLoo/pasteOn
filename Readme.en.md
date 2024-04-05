English | [简体中文](./Readme.md)
# Packaging Guide for Electron Apps

This guide outlines the steps to package Electron applications for Windows and macOS platforms.

## Prerequisites

Ensure your development environment has Node.js, npm, and all project dependencies installed. Specifically, the project should have `electron` and `electron-builder` added.

## Packaging Steps

### 1. Building Front-end Resources

If your project includes front-end resources (e.g., using React, Vue, etc.), you first need to build these resources:

```bash
npm run build
```

This will build the project according to your project configuration (e.g., Vite, Webpack, etc.) and generate static resources for packaging (in this project configured in Vite, the build output is the dist folder).

### 2. Packaging the App

Use `electron-builder` to package your app. You can choose to package for all platforms or just a specific one:

- **For all platforms**

  ```bash
  npm run dist
  ```

- **For Windows only**

  ```bash
  npm run dist -- -w
  ```

- **For macOS only**

  ```bash
  npm run dist -- -m
  ```

### 3. Testing Unpackaged App (Optional)

The `pack` command generates an unpackaged version of the app, useful for quick testing without creating a full installer:

```bash
npm run pack
```

This will generate an unpackaged version of the app in the `dist` folder.

## Distributing the App

Once the `dist` folder is ready, you can opt to compress the installer and upload it to GitHub Releases or other software distribution platforms. Typically, you need to upload:

- For Windows: The `.exe` installer and related update metadata files (e.g., `latest.yml`).
- For macOS: The `.dmg` or `.zip` package and related update metadata files.

`pasteOn-24.4.4.dmg`: This disk image file is commonly used for distributing macOS applications. Users can download and mount this disk image, then drag the application to their Applications folder. This is a common method for distributing macOS applications to end-users.

`pasteOn-24.4.4-mac.zip`: This compressed file contains the application. Some distribution channels may prefer ZIP files because they can be directly decompressed without needing to be mounted like DMG files.

Additionally, the icon files in the icons directory (icon.icns, icon.ico, macAppIcon.png) are prepared to support different operating systems and are used during the packaging process. These files are typically not distributed separately to users.

Lastly, the assets directory contains resources that your application may need at runtime. These files should already be included in your application package (pasteOn.app), so there's no need to distribute them separately.

## Version Control and Tagging

Tag each release with a Git tag, using the application's version number as the tag name:

```bash
git tag -a v<version number> -m "Release <version number>"
git push origin v<version number>
```

Upload the compressed package to GitHub Releases, npm, or other software distribution platforms. If using GitHub, you can attach this ZIP package as an asset when creating a new Release.

## Other Common Commands

```bash
asar extract app.asar ./

(base) yangdongju@localhost pasteOn % export PATH="$(npm config get prefix)/bin:$PATH"
(base) yangdongju@localhost pasteOn % pkg --version        
5.8.1
(base) yangdongju@localhost pasteOn % npm run build-server
```

## Considerations

- Packaging macOS apps typically requires being on a macOS system to meet Apple's signing requirements.
- Ensure your `package.json` is correctly configured with `electron-builder`, including the app ID, icons, etc.

## Reproduction and Commercial Use Restrictions

The documentation and code of this project are released under the [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.en.html). Anyone is free to use and distribute the code of this project under the terms of the AGPL v3, but modified versions must also be distributed under the AGPL v3 terms, and must clearly attribute the original author and source.

**Commercial Use Prohibited**: Without written consent from the original author, the content and code of this project may not be used for commercial purposes. Commercial entities wishing to use the content or code of this project should directly contact the project maintainer for authorization.