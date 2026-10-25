import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/tokens.css'
import './styles/base.css'
import './styles/tailwind.css'
import App from './App.jsx'
import { batDungLapKhiKhuat } from './shared/dungLapKhiKhuat.js'

batDungLapKhiKhuat()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
