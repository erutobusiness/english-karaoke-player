import React, { useState, useRef, useEffect } from 'react';

// 英文と各単語のタイミング情報を定義
const sampleText = {
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
  audioUrl: "/sample-audio.mp3" // オーディオファイルのパス
};

const EnglishKaraokePlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const animationFrameRef = useRef(null);

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

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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
      <div className="text-container" onClick={togglePlay}>
        {sampleText.words.map((word, index) => (
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
            {index < sampleText.words.length - 1 && " "}
          </span>
        ))}
      </div>
      
      <div className="controls">
        <button onClick={togglePlay}>
          {isPlaying ? "停止" : "再生"}
        </button>
      </div>
      
      <audio 
        ref={audioRef}
        src={sampleText.audioUrl}
        onEnded={handleAudioEnd}
      />
      
      <style jsx>{`
        .karaoke-player {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .text-container {
          font-size: 24px;
          line-height: 1.5;
          margin-bottom: 20px;
          cursor: pointer;
        }
        
        .word-container {
          display: inline-block;
          position: relative;
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
          margin-top: 20px;
        }
        
        button {
          padding: 10px 20px;
          font-size: 16px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default EnglishKaraokePlayer;
