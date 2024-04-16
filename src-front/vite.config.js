import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})

// // http
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import mkcert from "vite-plugin-mkcert";
 
// export default defineConfig({
//   server: {
//     https: true   // 需要开启https服务
//    },
//   plugins: [react(),mkcert()]    // 插件引用
// })

