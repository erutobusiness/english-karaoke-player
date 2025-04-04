import React, { useState, useRef, useEffect } from 'react';

// サンプルデータ
const initialSamples = [
  {
    id: 1,
    text: "This is an example of English text with karaoke-style animation.",
    words: [
      { word: "This", start: 0, duration: 0.5 },
      { word: "is", start: 0.5, duration: 0.3 },
      { word: "an", start: 0.8, duration: 0.3 },
      { word: "example", start: 1.1, duration: 0.7 },
      { word: "of", start: 1.8, duration: 0.3 },
      { word: "English", start: 2.1, duration: 0.6 },
      { word: "text", start: 2.7, duration: 0.5 },
      { word: "with", start: 3.2, duration: 0.4 },
      { word: "karaoke-style", start: 3.6, duration: 1.2 },
      { word: "animation.", start: 4.8, duration: 1.0 }
    ],
    audioUrl: "/sample-audio.mp3"
  },
  {
    id: 2,
    text: "Learning English can be fun with interactive exercises.",
    words: [
      { word: "Learning", start: 0, duration: 0.6 },
      { word: "English", start: 0.6, duration: 0.5 },
      { word: "can", start: 1.1, duration: 0.3 },
      { word: "be", start: 1.4, duration: 0.2 },
      { word: "fun", start: 1.6, duration: 0.4 },
      { word: "with", start: 2.0, duration: 0.3 },
      { word: "interactive", start: 2.3, duration: 0.8 },
      { word: "exercises.", start: 3.1, duration: 0.9 }
    ],
    audioUrl: "/sample-audio2.mp3"
  }
];

const CustomizableKaraokePlayer = () => {
  const [samples, setSamples] = useState(initialSamples);
  const [selectedSample, setSelectedSample] = useState(initialSamples[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  
  const audioRef = useRef(null);
  const animationFrameRef = useRef(null);
  const fileInputRef = useRef(null);

  // サンプル選択時の処理
  const handleSampleChange = (e) => {
    const selectedId = parseInt(e.target.value);
    const sample = samples.find(s => s.id === selectedId);
    if (sample) {
      setSelectedSample(sample);
      resetPlayer();
    }
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

  // プレイヤーのリセット
  const resetPlayer = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setCurrentTime(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
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

  // 編集モードの切り替え
  const toggleEditMode = () => {
    if (isEditing) {
      // 編集モードを終了
      setIsEditing(false);
    } else {
      // 編集モードを開始
      setEditedText(selectedSample.text);
      setIsEditing(true);
      resetPlayer();
    }
  };

  // テキスト変更時の処理
  const handleTextChange = (e) => {
    setEditedText(e.target.value);
  };

  // 新しいサンプルの保存
  const saveNewSample = () => {
    if (!editedText.trim()) return;
    
    // 単語分割と簡易的なタイミング生成
    const words = editedText.split(" ");
    const totalDuration = words.length * 0.5; // 簡易的に1単語あたり0.5秒と仮定
    
    const newWordsData = words.map((word, index) => {
      return {
        word,
        start: index * 0.5,
        duration: 0.5
      };
    });
    
    const newSample = {
      id: samples.length + 1,
      text: editedText,
      words: newWordsData,
      audioUrl: selectedSample.audioUrl // 既存の音声を仮に使用
    };
    
    setSamples([...samples, newSample]);
    setSelectedSample(newSample);
    setIsEditing(false);
    resetPlayer();
  };

  // オーディオファイルのアップロード処理
  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const audioUrl = URL.createObjectURL(file);
    setSelectedSample({
      ...selectedSample,
      audioUrl
    });
    
    resetPlayer();
  };

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // オブジェクトURLのクリーンアップ
      samples.forEach(sample => {
        if (sample.audioUrl && sample.audioUrl.startsWith('blob:')) {
          URL.revokeObjectURL(sample.audioUrl);
        }
      });
    };
  }, [samples]);

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

  return (
    <div className="karaoke-player">
      {isEditing ? (
        <div className="edit-panel">
          <h3>テキストを編集</h3>
          <textarea
            value={editedText}
            onChange={handleTextChange}
            rows={5}
            cols={50}
            placeholder="英文を入力してください..."
          />
          <div className="button-group">
            <button onClick={saveNewSample}>保存</button>
            <button onClick={toggleEditMode}>キャンセル</button>
          </div>
        </div>
      ) : (
        <>
          <div className="controls-top">
            <select value={selectedSample.id} onChange={handleSampleChange}>
              {samples.map(sample => (
                <option key={sample.id} value={sample.id}>
                  {sample.text.substring(0, 30)}...
                </option>
              ))}
            </select>
            <button onClick={toggleEditMode}>新しいテキストを作成</button>
          </div>
          
          <div className="text-container" onClick={togglePlay}>
            {selectedSample.words.map((word, index) => (
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
                {index < selectedSample.words.length - 1 && " "}
              </span>
            ))}
          </div>
          
          <div className="controls">
            <button onClick={togglePlay}>
              {isPlaying ? "停止" : "再生"}
            </button>
            <input
              type="file"
              accept="audio/*"
              ref={fileInputRef}
              onChange={handleAudioUpload}
              style={{ display: 'none' }}
            />
            <button onClick={() => fileInputRef.current.click()}>
              音声をアップロード
            </button>
          </div>
        </>
      )}
      
      <audio 
        ref={audioRef}
        src={selectedSample.audioUrl}
        onEnded={handleAudioEnd}
      />
      
      <style jsx>{`
        .karaoke-player {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .controls-top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        select {
          padding: 8px;
          font-size: 16px;
          min-width: 200px;
        }
        
        .text-container {
          font-size: 24px;
          line-height: 1.5;
          margin: 30px 0;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          min-height: 100px;
          display: flex;
          flex-wrap: wrap;
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
        
        .controls {
          display: flex;
          gap: 10px;
        }
        
        button {
          padding: 10px 20px;
          font-size: 16px;
          cursor: pointer;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
        }
        
        button:hover {
          background-color: #45a049;
        }
        
        .edit-panel {
          margin: 20px 0;
        }
        
        textarea {
          width: 100%;
          padding: 10px;
          font-size: 16px;
          margin-bottom: 10px;
          font-family: Arial, sans-serif;
        }
        
        .button-group {
          display: flex;
          gap: 10px;
        }
      `}</style>
    </div>
  );
};

export default CustomizableKaraokePlayer;
