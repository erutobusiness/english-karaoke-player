import { useState, useCallback } from 'react'; // useRef, useEffect を削除
import { karaokeData } from './data';
import { useKaraokePlayer } from '../../hooks/useKaraokePlayer';

// useKaraokePlayer から渡されるアクションの型を定義 (フック側と合わせる)
interface KaraokeActions {
  play: () => void;
  reset: () => void;
}

const EnglishKaraokePlayer = () => {
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);

  const activeKaraokeData = karaokeData[activeItemIndex];
  const activeAudioUrl = activeKaraokeData?.audioUrl ?? '';
  const activeWords = activeKaraokeData?.words ?? [];

  const handleNextLine = useCallback((actions: KaraokeActions) => {
    const nextIndex = activeItemIndex + 1;
    if (nextIndex < karaokeData.length) {
      setActiveItemIndex(nextIndex);
      setTimeout(() => { actions.play(); }, 100);
    } else {
      actions.reset();
    }
  }, [activeItemIndex]);

  // onNextLine に直接 handleNextLine を渡す
  const {
    audioRef,
    isPlaying,
    currentTime, // currentTime を追加
    isContinuousPlay,
    play,
    pause,
    reset,
    toggleContinuousPlay,
    getPartialHighlight,
    handleAudioEnd,
  } = useKaraokePlayer({
    audioUrl: activeAudioUrl,
    words: activeWords,
    onNextLine: handleNextLine, // 修正したハンドラを渡す
  });

  // クリックハンドラ (依存配列は変更なし、play/reset はフックから取得した安定したもの)
  const handleActivate = useCallback((index: number) => {
    if (isContinuousPlay && isPlaying) return;
    reset();
    setActiveItemIndex(index);
    setTimeout(() => { play(); }, 100);
  }, [isContinuousPlay, isPlaying, play, reset]);

  // 再生/停止トグルハンドラ (依存配列は変更なし)
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // 停止ハンドラ (依存配列は変更なし)
  const handleStop = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div className="karaoke-container single-box-inline">
      <div className="karaoke-text-display">
        {karaokeData.map((item, itemIndex) => (
          <button
            type="button"
            key={item.audioUrl}
            className={`karaoke-sentence ${itemIndex === activeItemIndex ? 'active' : ''}`}
            onClick={() => handleActivate(itemIndex)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleActivate(itemIndex); }}
            style={{ background: 'none', border: 'none', padding: 0, margin: 0, textAlign: 'left', cursor: 'pointer' }}
          >
            {item.words.map((word) => (
              <span key={`${item.audioUrl}-${word.start}`} className="karaoke-word-container">
                <span className="karaoke-word">
                  <span className="karaoke-original-text">
                    {word.word}
                  </span>
                  <span
                    className="karaoke-highlight-layer"
                    style={{
                      width: `${itemIndex === activeItemIndex ? getPartialHighlight(word) : 0}%`
                    }}
                  >
                    {word.word}
                  </span>
                </span>
                {' '}
              </span>
            ))}
             {itemIndex < karaokeData.length - 1 && <span style={{marginRight: '0.25em'}} />}
          </button>
        ))}
      </div>

      <div className="controls-container controls-bottom">
        <button
          type="button"
          className="karaoke-button"
          onClick={handleTogglePlay}
        >
          {isPlaying ? "一時停止" : "再生"}
        </button>
        <button
          type="button"
          className={`karaoke-button ${isContinuousPlay ? 'active' : ''}`}
          onClick={toggleContinuousPlay}
        >
          {isContinuousPlay ? "全文" : "一文"}
        </button>
        <button
          type="button"
          className="karaoke-button"
          onClick={handleStop}
          disabled={!isPlaying && currentTime === 0} // isPlaying が false かつ currentTime が 0 の場合のみ無効
        >
          停止
        </button>
      </div>

      {activeAudioUrl && (
        <audio
          ref={audioRef}
          src={activeAudioUrl}
          onEnded={handleAudioEnd}
        >
          <track kind='captions' />
        </audio>
      )}
    </div>
  );
};

export default EnglishKaraokePlayer;
