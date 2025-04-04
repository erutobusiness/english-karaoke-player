import { useState } from 'react';
import './App.css';
import EnglishKaraokePlayer from './components/EnglishKaraokePlayer';
import CustomizableKaraokePlayer from './components/CustomizableKaraokePlayer';
import AdvancedKaraokeEditor from './components/AdvancedKaraokeEditor';

function App() {
  const [activeTab, setActiveTab] = useState('basic');

  return (
    <div className="app">
      <header className="app-header">
        <h1>英語カラオケプレーヤー</h1>
      </header>
      <main>
        <div className="tab-container">
          <div className="tab-buttons">
            <button type="button"
              className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              基本プレーヤー
            </button>
            <button type="button"
              className={`tab-button ${activeTab === 'customizable' ? 'active' : ''}`}
              onClick={() => setActiveTab('customizable')}
            >
              カスタマイズ
            </button>
            <button type="button"
              className={`tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
              onClick={() => setActiveTab('advanced')}
            >
              高度なエディター
            </button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'basic' && <EnglishKaraokePlayer />}
            {activeTab === 'customizable' && <CustomizableKaraokePlayer />}
            {activeTab === 'advanced' && <AdvancedKaraokeEditor />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
