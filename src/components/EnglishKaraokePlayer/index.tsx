import { useState, useCallback } from 'react';
import './index.css';
import { sampleText, type KaraokeText } from './data';
import { useKaraokePlayer } from '../../hooks/useKaraokePlayer';

// 複数のカラオケデータを配列で管理
const karaokeData: KaraokeText[] = Array(5).fill(sampleText);

const EnglishKaraokePlayer = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0); // 現在のテキストインデックスはコンポーネントで管理
  const currentKaraokeText = karaokeData[currentTextIndex]; // 現在のカラオケテキスト

  // 次のテキストへ移動するコールバック (フックの onEnded に渡す)
  const handleTrackEnd = useCallback(() => {
    setCurrentTextIndex(prevIndex => {
      if (prevIndex < karaokeData.length - 1) {
        return prevIndex + 1;
      }
      return 0; // 最後まで行ったら最初に戻る
    });
  }, []);

  const {
    audioRef,
    isPlaying,
    togglePlay,
    getPartialHighlight,
    handleAudioEnd,
  } = useKaraokePlayer({
    audioUrl: currentKaraokeText.audioUrl,
    words: currentKaraokeText.words,
    onEnded: handleTrackEnd,
  });

  return (
    <div className="karaoke-player">
      <button
        type="button"
        className="text-container"
        onClick={togglePlay}
      >
        {currentKaraokeText.words.map((word, index) => (
          <span key={`${currentKaraokeText.audioUrl}-${word.start}-${index}`} className="karaoke-word-container">
            <span className="karaoke-word">
              <span className="karaoke-original-text">
                {word.word}
              </span>
              <span
                className="karaoke-highlight-layer"
                style={{
                  width: `${getPartialHighlight(word)}%`
                }}
              >
                {word.word}
              </span>
            </span>
            {index < currentKaraokeText.words.length - 1 && " "}
          </span>
        ))}
      </button>

      <div className="controls">
        <button type="button" onClick={togglePlay}>
          {isPlaying ? "停止" : "再生"}
        </button>
      </div>

      <audio
        ref={audioRef}
        src={currentKaraokeText.audioUrl}
        onEnded={handleAudioEnd}
      >
        <track kind='captions' />
      </audio>
    </div>
  );
};

export default EnglishKaraokePlayer;
