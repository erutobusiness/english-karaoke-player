import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error("Failed to find the root element") // root要素が見つからない場合のエラー処理
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
