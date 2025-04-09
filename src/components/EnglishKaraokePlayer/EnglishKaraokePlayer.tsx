import { useState, useCallback, useRef } from 'react';
import { karaokeData } from './data';
import { useKaraokePlayer } from '../../hooks/useKaraokePlayer';
import Wayaku from './Wayaku';

// useKaraokePlayer から渡されるアクションの型を定義 (フック側と合わせる)
interface KaraokeActions {
  play: () => void;
  reset: () => void;
}

const EnglishKaraokePlayer = () => {
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  // 英文全体のコンテナへのref
  const englishContainerRef = useRef<HTMLDivElement>(null);
  // 英文テキスト用のラッパーへのref
  const englishTextsWrapperRef = useRef<HTMLDivElement>(null);

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
    currentTime,
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
    onNextLine: handleNextLine,
  });

  // 単語クリック/キーダウン時のハンドラ (イベントから sentenceIndex を取得)
  const handleWordActivate = useCallback((event: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => {
    const target = event.currentTarget;
    const sentenceIndexStr = target.dataset.sentenceIndex;
    if (sentenceIndexStr === undefined) return;

    const index = Number.parseInt(sentenceIndexStr, 10); // Use Number.parseInt
    if (Number.isNaN(index)) return; // Use Number.isNaN

    // 元の handleActivate のロジックを実行
    if (isContinuousPlay && isPlaying) return;
    reset();
    setActiveItemIndex(index);
    setTimeout(() => { play(); }, 100);
  }, [isContinuousPlay, isPlaying, play, reset]); // 依存関係は元の handleActivate と同じ

  // 単語のキーボード操作ハンドラ
  const handleWordKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleWordActivate(event); // クリックと同じ処理を呼び出す
    }
  };


  // 再生/停止トグルハンドラ
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // 停止ハンドラ
  const handleStop = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div className="karaoke-container single-box-inline">
      <div ref={englishContainerRef} className="karaoke-text-display">
        {/* 英文表示エリア */}
        <div ref={englishTextsWrapperRef} className="english-texts-wrapper">
          {/* flatMap を使用して全単語をフラットにレンダリング */}
          {karaokeData.flatMap((item, itemIndex) => {
            // Map words to their spans
            const wordSpans = item.words.map((word) => (
              <span
                key={`${item.audioUrl}-${word.start}`}
                className={`karaoke-word ${itemIndex === activeItemIndex ? 'active-sentence' : ''}`}
                data-sentence-index={itemIndex}
                tabIndex={-1}
                onClick={handleWordActivate}
                onKeyDown={handleWordKeyDown}
                style={{ cursor: 'pointer' }}
              >
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
                {/* Add a space after each word */}
                {' '}
              </span>
            ));

            // Add a space span after the sentence if it's not the last one
            if (itemIndex < karaokeData.length - 1) {
              return wordSpans.concat(<span key={`space-${itemIndex}`}>{' '}</span>);
            }
            // If it's the last sentence, just return the word spans
            return wordSpans;
          // End of flatMap callback
          })}
        </div>

        {/* 和訳コンポーネント */}
        <Wayaku 
          karaokeData={karaokeData} 
          containerRef={englishContainerRef} 
          textsWrapperRef={englishTextsWrapperRef} 
        />
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
          disabled={!isPlaying && currentTime === 0}
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