import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'
import './styles/karaoke.css' // Import common karaoke styles

const rootElement = document.getElementById('root')

// root要素が見つからない場合のエラー処理
if (!rootElement) {
  throw new Error("Failed to find the root element")
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
