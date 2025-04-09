import { useState, useCallback, useRef } from 'react';
import { karaokeData } from './data';
import { useKaraokePlayer } from '../../hooks/useKaraokePlayer';
import Wayaku from './Wayaku';

interface KaraokeActions {
  play: () => void;
  reset: () => void;
}

const EnglishKaraokePlayer = () => {
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const englishContainerRef = useRef<HTMLDivElement>(null);
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

  const handleWordActivate = useCallback((event: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => {
    const target = event.currentTarget;
    const sentenceIndexStr = target.dataset.sentenceIndex;
    if (sentenceIndexStr === undefined) return;

    const index = Number.parseInt(sentenceIndexStr, 10);
    if (Number.isNaN(index)) return;

    if (isContinuousPlay && isPlaying) return;
    reset();
    setActiveItemIndex(index);
    setTimeout(() => { play(); }, 100);
  }, [isContinuousPlay, isPlaying, play, reset]);

  const handleWordKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleWordActivate(event);
    }
  };

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const handleStop = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div className="karaoke-container single-box-inline">
      <div ref={englishContainerRef} className="karaoke-text-display">
        <div ref={englishTextsWrapperRef} className="english-texts-wrapper">
          {karaokeData.flatMap((item, itemIndex) => {
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
              </span>
            ));

            if (itemIndex < karaokeData.length - 1) {
              return wordSpans.concat(<span key={`karaoke-space-${item.text}`} className="sentence-space" />);
            }
            return wordSpans;
          })}
        </div>

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