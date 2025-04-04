import React, { useState, useRef, useEffect } from 'react';

const AdvancedKaraokeEditor = () => {
  const [text, setText] = useState("");
  const [words, setWords] = useState([]);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioDuration, setAudioDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedWordIndex, setSelectedWordIndex] = useState(-1);
  const [isEditingText, setIsEditingText] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const animationFrameRef = useRef(null);
  const timelineRef = useRef(null);

  // オーディオファイルのアップロード処理
  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    
    // 既存のURLをクリーンアップ
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }
    
    // オーディオの長さを取得
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(audio.duration);
    });
  };

  // テキスト変更時の処理
  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  // テキストの分割処理
  const splitText = () => {
    if (!text.trim()) return;
    
    const wordsArray = text.trim().split(/\s+/);
    const defaultDuration = audioDuration > 0 ? audioDuration / wordsArray.length : 0.5;
    
    const newWords = wordsArray.map((word, index) => {
      return {
        word,
        start: index * defaultDuration,
        duration: defaultDuration
      };
    });
    
    setWords(newWords);
    setIsEditingText(false);
  };

  // 再生/停止の処理
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    } else {
      audioRef.current.play();
      startTimeTracking();
    }
    
    setIsPlaying(!isPlaying);
  };

  // 時間追跡のアニメーションフレーム
  const startTimeTracking = () => {
    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(updateTime);
  };

  // オーディオ終了時の処理
  const handleAudioEnd = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // 単語選択時の処理
  const selectWord = (index) => {
    setSelectedWordIndex(index);
    
    // 選択した単語の開始時間に移動
    if (audioRef.current && index >= 0 && index < words.length) {
      audioRef.current.currentTime = words[index].start;
      setCurrentTime(words[index].start);
    }
  };

  // 単語の開始時間設定
  const setWordStart = () => {
    if (selectedWordIndex < 0 || !audioRef.current) return;
    
    const newWords = [...words];
    const currentAudioTime = audioRef.current.currentTime;
    
    // 開始時間を現在の再生位置に設定
    newWords[selectedWordIndex] = {
      ...newWords[selectedWordIndex],
      start: currentAudioTime
    };
    
    // 次の単語がある場合は、その単語の終了時間を調整
    if (selectedWordIndex < words.length - 1) {
      const nextStart = newWords[selectedWordIndex + 1].start;
      if (currentAudioTime >= nextStart) {
        // 次の単語の開始時間を現在の単語の開始時間 + 0.1秒に設定
        newWords[selectedWordIndex + 1].start = currentAudioTime + 0.1;
      }
    }
    
    // 前の単語がある場合は、その単語の終了時間を調整
    if (selectedWordIndex > 0) {
      const prevWord = newWords[selectedWordIndex - 1];
      const prevDuration = currentAudioTime - prevWord.start;
      if (prevDuration > 0) {
        prevWord.duration = prevDuration;
      } else {
        // 前の単語の開始時間が現在の単語の開始時間より後の場合
        prevWord.start = currentAudioTime - 0.1;
        prevWord.duration = 0.1;
      }
    }
    
    // 現在の単語の持続時間を調整
    if (selectedWordIndex < words.length - 1) {
      newWords[selectedWordIndex].duration = 
        newWords[selectedWordIndex + 1].start - currentAudioTime;
    } else {
      // 最後の単語の場合、デフォルトで1秒の持続時間
      newWords[selectedWordIndex].duration = 1.0;
    }
    
    setWords(newWords);
  };

  // 単語の終了時間設定
  const setWordEnd = () => {
    if (selectedWordIndex < 0 || !audioRef.current) return;
    
    const newWords = [...words];
    const currentAudioTime = audioRef.current.currentTime;
    const selectedWord = newWords[selectedWordIndex];
    
    if (currentAudioTime <= selectedWord.start) {
      // 終了時間が開始時間より前の場合はエラー
      alert("終了時間は開始時間より後に設定してください");
      return;
    }
    
    // 持続時間を更新
    const newDuration = currentAudioTime - selectedWord.start;
    newWords[selectedWordIndex] = {
      ...selectedWord,
      duration: newDuration
    };
    
    // 次の単語の開始時間を調整
    if (selectedWordIndex < words.length - 1) {
      const nextWord = newWords[selectedWordIndex + 1];
      if (currentAudioTime > nextWord.start) {
        nextWord.start = currentAudioTime;
      }
    }
    
    setWords(newWords);
  };

  // タイムラインでの時間移動
  const handleTimelineClick = (e) => {
    if (!audioRef.current || !timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * audioDuration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // タイムライン上の単語位置を計算
  const getWordPosition = (word) => {
    if (audioDuration <= 0) return { left: 0, width: 0 };
    
    const left = (word.start / audioDuration) * 100;
    const width = (word.duration / audioDuration) * 100;
    
    return { left: `${left}%`, width: `${width}%` };
  };

  // プレビューモードの切り替え
  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
    setSelectedWordIndex(-1);
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
    
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  // 単語がハイライトされるべきかどうかの判定
  const isHighlighted = (word) => {
    return (
      currentTime >= word.start && 
      currentTime < word.start + word.duration
    );
  };

  // 単語の進行度に基づいた部分ハイライト
  const getPartialHighlight = (word) => {
    if (currentTime < word.start) return 0;
    if (currentTime > word.start + word.duration) return 100;
    
    const progress = (currentTime - word.start) / word.duration;
    return Math.min(progress * 100, 100);
  };

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // オブジェクトURLのクリーンアップ
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // プロジェクトのエクスポート
  const exportProject = () => {
    if (!words.length) return;
    
    const project = {
      text: words.map(w => w.word).join(' '),
      words,
      audioDuration
    };
    
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'karaoke-project.json';
    a.click();
    
    URL.revokeObjectURL(url);
  };

  // プロジェクトのインポート
  const importProject = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const project = JSON.parse(event.target.result);
        if (project.words && Array.isArray(project.words)) {
          setWords(project.words);
          setText(project.text || project.words.map(w => w.word).join(' '));
          setAudioDuration(project.audioDuration || 0);
        }
      } catch (error) {
        console.error('Failed to parse project file:', error);
        alert('プロジェクトファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="karaoke-editor">
      <h2>英語カラオケエディタ</h2>
      
      <div className="audio-section">
        <h3>音声ファイル</h3>
        <input
          type="file"
          accept="audio/*"
          ref={fileInputRef}
          onChange={handleAudioUpload}
          className="audio-input"
        />
        {audioUrl && (
          <div className="audio-controls">
            <button onClick={togglePlay}>
              {isPlaying ? "停止" : "再生"}
            </button>
            <div className="audio-info">
              長さ: {audioDuration.toFixed(2)}秒
            </div>
          </div>
        )}
      </div>
      
      {!audioUrl && (
        <div className="instructions">
          まず、音声ファイルをアップロードしてください。
        </div>
      )}
      
      {audioUrl && (
        <>
          {isEditingText ? (
            <div className="text-section">
              <h3>英文を入力</h3>
              <textarea
                value={text}
                onChange={handleTextChange}
                rows={4}
                placeholder="英文を入力してください..."
              />
              <div className="button-group">
                <button onClick={splitText}>分割して編集</button>
                <button onClick={() => setIsEditingText(false)}>キャンセル</button>
              </div>
            </div>
          ) : words.length === 0 ? (
            <div className="text-section">
              <button onClick={() => setIsEditingText(true)}>英文を入力</button>
            </div>
          ) : previewMode ? (
            <div className="preview-section">
              <h3>プレビュー</h3>
              <div className="text-container" onClick={togglePlay}>
                {words.map((word, index) => (
                  <span key={index} className="word-container">
                    <span className="word">
                      <span 
                        className="highlight" 
                        style={{ 
                          width: `${getPartialHighlight(word)}%`
                        }}
                      >
                        {word.word}
                      </span>
                      <span className="original">
                        {word.word}
                      </span>
                    </span>
                    {index < words.length - 1 && " "}
                  </span>
                ))}
              </div>
              <button onClick={togglePreviewMode}>編集モードに戻る</button>
            </div>
          ) : (
            <div className="edit-section">
              <div className="controls-top">
                <button onClick={() => setIsEditingText(true)}>テキストを編集</button>
                <button onClick={togglePreviewMode}>プレビュー</button>
                <button onClick={exportProject}>プロジェクトを保存</button>
                <input
                  type="file"
                  accept=".json"
                  onChange={importProject}
                  style={{ display: 'none' }}
                  id="import-project"
                />
                <label htmlFor="import-project" className="button">
                  プロジェクトを読み込む
                </label>
              </div>
              
              <h3>タイミング編集</h3>
              <div className="timeline-container">
                <div 
                  className="timeline" 
                  ref={timelineRef}
                  onClick={handleTimelineClick}
                >
                  <div 
                    className="current-time-marker" 
                    style={{ left: `${(currentTime / audioDuration) * 100}%` }}
                  />
                  
                  {words.map((word, index) => {
                    const { left, width } = getWordPosition(word);
                    return (
                      <div
                        key={index}
                        className={`word-block ${selectedWordIndex === index ? 'selected' : ''}`}
                        style={{ left, width }}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectWord(index);
                        }}
                      >
                        <div className="word-label">{word.word}</div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="time-markers">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <div key={i} className="time-marker">
                      {(i * audioDuration / 10).toFixed(1)}s
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="word-edit-controls">
                {selectedWordIndex >= 0 && selectedWordIndex < words.length && (
                  <div className="word-info">
                    <div>
                      選択中: <b>{words[selectedWordIndex].word}</b>
                    </div>
                    <div>
                      開始: {words[selectedWordIndex].start.toFixed(2)}秒
                    </div>
                    <div>
                      長さ: {words[selectedWordIndex].duration.toFixed(2)}秒
                    </div>
                    <div className="button-group">
                      <button onClick={setWordStart}>開始時間を設定</button>
                      <button onClick={setWordEnd}>終了時間を設定</button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="words-list">
                <h4>単語リスト</h4>
                <div className="words-grid">
                  {words.map((word, index) => (
                    <div 
                      key={index}
                      className={`word-item ${selectedWordIndex === index ? 'selected' : ''}`}
                      onClick={() => selectWord(index)}
                    >
                      <div className="word-text">{word.word}</div>
                      <div className="word-time">
                        {word.start.toFixed(2)}s - {(word.start + word.duration).toFixed(2)}s
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      <audio 
        ref={audioRef}
        src={audioUrl}
        onEnded={handleAudioEnd}
      />
      
      <style jsx>{`
        .karaoke-editor {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        h2, h3, h4 {
          color: #333;
        }
        
        .audio-section, .text-section, .edit-section, .preview-section {
          margin-bottom: 20px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        
        .audio-controls {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-top: 10px;
        }
        
        .audio-info {
          font-size: 14px;
          color: #666;
        }
        
        .instructions {
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
        }
        
        textarea {
          width: 100%;
          padding: 10px;
          font-size: 16px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: Arial, sans-serif;
        }
        
        .button-group {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        
        button, .button {
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          display: inline-block;
        }
        
        button:hover, .button:hover {
          background-color: #45a049;
        }
        
        .controls-top {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .timeline-container {
          margin: 20px 0;
        }
        
        .timeline {
          height: 100px;
          background-color: #f0f0f0;
          position: relative;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 5px;
          cursor: pointer;
        }
        
        .current-time-marker {
          position: absolute;
          top: 0;
          width: 2px;
          height: 100%;
          background-color: red;
          z-index: 10;
        }
        
        .word-block {
          position: absolute;
          height: 40px;
          top: 30px;
          background-color: #4285f4;
          border-radius: 4px;
          color: white;
          padding: 2px 5px;
          font-size: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .word-block:hover {
          background-color: #2a75f3;
        }
        
        .word-block.selected {
          background-color: #ea4335;
        }
        
        .word-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 12px;
        }
        
        .time-markers {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
        }
        
        .word-edit-controls {
          margin: 15px 0;
          min-height: 80px;
        }
        
        .word-info {
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 4px;
        }
        
        .words-list {
          margin-top: 20px;
        }
        
        .words-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .word-item {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .word-item:hover {
          background-color: #f0f0f0;
        }
        
        .word-item.selected {
          background-color: #e0e0e0;
          border-color: #aaa;
        }
        
        .word-text {
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .word-time {
          font-size: 12px;
          color: #666;
        }
        
        /* プレビューモードのスタイル */
        .text-container {
          font-size: 24px;
          line-height: 1.5;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin: 20px 0;
          cursor: pointer;
          min-height: 100px;
        }
        
        .word-container {
          display: inline-block;
          position: relative;
          margin: 0 2px;
        }
        
        .word {
          position: relative;
          display: inline-block;
        }
        
        .highlight {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          overflow: hidden;
          color: red;
          white-space: nowrap;
          pointer-events: none;
        }
        
        .original {
          color: black;
          position: relative;
          z-index: -1;
        }
      `}</style>
    </div>
  );
};

export default AdvancedKaraokeEditor;
