import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ConfigProvider } from './hook/ConfigContext .jsx'
import { NotificationProvider } from './hook/NotificationContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
     <ConfigProvider>
      <NotificationProvider>
    <App />
      </NotificationProvider>
     </ConfigProvider>
  </React.StrictMode>,
)
