import { useState, useCallback } from 'react'; // useRef, useEffect は不要に
import './index.css'; // 作成した CSS ファイルをインポート
import { sampleText, type KaraokeText } from './data'; // WordInfo はフックからインポート
import { useKaraokePlayer, type WordInfo } from '../../hooks/useKaraokePlayer'; // フックと WordInfo をインポート

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
  }, []); // karaokeData.length は不変なので依存配列は空

  // useKaraokePlayer フックを使用
  const {
    audioRef,
    isPlaying,
    togglePlay,
    getPartialHighlight,
    handleAudioEnd, // フックが提供する onEnded ハンドラ (audio 要素に渡す)
  } = useKaraokePlayer({
    audioUrl: currentKaraokeText.audioUrl,
    words: currentKaraokeText.words,
    onEnded: handleTrackEnd, // 曲が終わったら handleTrackEnd を実行
  });

  return (
    <div className="karaoke-player">
      <div
        className="text-container"
        onClick={togglePlay}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') togglePlay(); }}
        role="button"
        tabIndex={0}
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
      </div>

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
