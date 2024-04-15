<script src="http://localhost:8097"></script>
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ConfigProvider } from './hook/ConfigContext .jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
     <ConfigProvider>
    <App />
     </ConfigProvider>
  </React.StrictMode>,
)
