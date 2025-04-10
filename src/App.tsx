import { useState } from "react";
import "./styles/App.css";
import "./styles/karaoke.css";
import Basic from "./components/Basic/Basic";
import Speaker from "./components/Speaker/Speaker";

function App() {
  const [activeTab, setActiveTab] = useState("basic");

  return (
    <div className="app">
      <header className="app-header">
        <h1>英語カラオケプレーヤー</h1>
      </header>
      <main>
        <div className="tab-container">
          <div className="tab-buttons">
            <button
              type="button"
              className={`tab-button ${activeTab === "basic" ? "active" : ""}`}
              onClick={() => setActiveTab("basic")}
            >
              基本
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === "speaker" ? "active" : ""}`}
              onClick={() => setActiveTab("speaker")}
            >
              話者
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "basic" && <Basic />}
            {activeTab === "speaker" && <Speaker />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
