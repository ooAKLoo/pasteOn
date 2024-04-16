// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
// })

//2.在vite.config.js里面引入
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from "vite-plugin-mkcert";
 
export default defineConfig({
  server: {
    https: true   // 需要开启https服务
   },
  plugins: [react(),mkcert()]    // 插件引用
})
// // vite.config.js
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import fs from 'fs';
// import path from 'path';

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     https: {
//       key: fs.readFileSync(path.resolve(__dirname, './cert/localhost.key')),
//       cert: fs.readFileSync(path.resolve(__dirname, './cert/localhost.crt'))
//     }
//   }
// });
