const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const platformMap = {
  win32: "win-x64",
  darwin: "macos-x64",
  linux: "linux-x64"
};

console.log("hsdaufisudf-----------")
const currentPlatform = platformMap[process.platform];
if (!currentPlatform) {
  console.error(`Unsupported platform: ${process.platform}`);
  process.exit(1);
}

const outputFileName = `server-${currentPlatform}`;
const outputPath = path.join(__dirname, 'server', outputFileName);

// 检查是否已经存在可执行文件
if (!fs.existsSync(outputPath)) {
  try {
    // 为当前平台打包
    const target = `node14-${currentPlatform}`;
    const cmd = `pkg -t ${target} ./socket/server.js --output ${outputPath}`;
    execSync(cmd, { stdio: 'inherit' });
    console.log(`${outputFileName} has been generated.`);
  } catch (error) {
    console.error(`Failed to package server.js for ${currentPlatform}:`, error);
  }
} else {
  console.log(`${outputFileName} already exists. Skipping packaging.`);
}
