import { useState } from "react";
import "./styles/App.css";
import "./styles/karaoke.css";
import AdvancedKaraokeEditor from "./components/AdvancedKaraokeEditor/AdvancedKaraokeEditor";
import CustomizableKaraokePlayer from "./components/CustomizableKaraokePlayer/CustomizableKaraokePlayer";
import EnglishKaraokePlayer from "./components/EnglishKaraokePlayer/EnglishKaraokePlayer";

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
              基本プレーヤー
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === "customizable" ? "active" : ""}`}
              onClick={() => setActiveTab("customizable")}
            >
              カスタマイズ
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === "advanced" ? "active" : ""}`}
              onClick={() => setActiveTab("advanced")}
            >
              高度なエディター
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "basic" && <EnglishKaraokePlayer />}
            {activeTab === "customizable" && <CustomizableKaraokePlayer />}
            {activeTab === "advanced" && <AdvancedKaraokeEditor />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
