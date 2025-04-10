import React, { useState, useCallback, useRef } from "react";
import { useKaraokePlayer } from "../../hooks/useKaraokePlayer";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import Wayaku from "./Wayaku";
import { karaokeData } from "./data";

interface KaraokeActions {
  play: () => void;
  reset: () => void;
}

const Basic = () => {
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0); // アクティブな単語のインデックス
  const [showWayaku, setShowWayaku] = useState<boolean>(true); // 和訳表示の状態を管理
  const [isShadowMode, setIsShadowMode] = useState<boolean>(false); // シャドーモードの状態を管理
  const englishContainerRef = useRef<HTMLDivElement>(null);
  const englishTextsWrapperRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement | null>(null); // アクティブな単語への参照

  const activeKaraokeData = karaokeData[activeItemIndex];
  const activeAudioUrl = activeKaraokeData?.audioUrl ?? "";
  const activeWords = activeKaraokeData?.words ?? [];

  // 単語が表示範囲外の場合に自動スクロールするカスタムフックを使用
  useAutoScroll(activeWordRef, englishContainerRef, [activeItemIndex, activeWordIndex]);

  const handleNextLine = useCallback(
    (actions: KaraokeActions) => {
      const nextIndex = activeItemIndex + 1;
      if (nextIndex < karaokeData.length) {
        setActiveItemIndex(nextIndex);
        setActiveWordIndex(0); // 次の行に移動したら単語インデックスをリセット
        setTimeout(() => {
          actions.play();
        }, 100);
      } else {
        actions.reset();
      }
    },
    [activeItemIndex]
  );

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
    onWordChange: setActiveWordIndex, // 単語インデックスを更新するコールバック
  });

  const handleWordActivate = useCallback(
    (event: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => {
      const target = event.currentTarget;
      const sentenceIndexStr = target.dataset.sentenceIndex;
      const wordIndexStr = target.dataset.wordIndex;
      if (sentenceIndexStr === undefined || wordIndexStr === undefined) return;

      const sentenceIndex = Number.parseInt(sentenceIndexStr, 10);
      const wordIndex = Number.parseInt(wordIndexStr, 10);
      if (Number.isNaN(sentenceIndex) || Number.isNaN(wordIndex)) return;

      reset();
      setActiveItemIndex(sentenceIndex);
      setActiveWordIndex(wordIndex);
      setTimeout(() => {
        play();
      }, 100);
    },
    [play, reset]
  );

  const handleWordKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Enter" || event.key === " ") {
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

  const handleToggleWayaku = useCallback(() => {
    setShowWayaku((prev) => !prev);
  }, []);

  // シャドーモードの切り替え処理
  const handleToggleShadowMode = useCallback(() => {
    setIsShadowMode((prev) => !prev);
  }, []);

  return (
    <div className="karaoke-container single-box-inline">
      <div
        ref={englishContainerRef}
        className={`karaoke-text-display${isShadowMode ? " shadow-mode" : ""}`}
      >
        <div ref={englishTextsWrapperRef} className="english-texts-wrapper">
          {karaokeData.map((item, itemIndex) => (
            <React.Fragment key={`sentence-${item.audioUrl}-${itemIndex}`}>
              {item.words.map((word, wordIndex) => (
                <span
                  key={`${item.audioUrl}-${word.start}`}
                  className={`karaoke-word ${
                    itemIndex === activeItemIndex && wordIndex === activeWordIndex
                      ? "active-word"
                      : ""
                  }`}
                  data-sentence-index={itemIndex}
                  data-word-index={wordIndex}
                  tabIndex={-1}
                  onClick={handleWordActivate}
                  onKeyDown={handleWordKeyDown}
                  ref={
                    itemIndex === activeItemIndex && wordIndex === activeWordIndex
                      ? activeWordRef
                      : null
                  } // アクティブな単語にrefを設定
                >
                  <span className="karaoke-original-text">{word.word}</span>
                  <span
                    className="karaoke-highlight-layer"
                    style={{
                      width: `${itemIndex === activeItemIndex ? getPartialHighlight(word) : 0}%`,
                    }}
                  >
                    {word.word}
                  </span>
                </span>
              ))}
              {/* 文の後ろにスペースを追加 */}
              {item.widthAdjustment && <span style={{ width: `${item.widthAdjustment}px` }} />}
            </React.Fragment>
          ))}
        </div>

        {showWayaku && (
          <Wayaku
            karaokeData={karaokeData}
            containerRef={englishContainerRef}
            textsWrapperRef={englishTextsWrapperRef}
          />
        )}
      </div>

      <div className="controls-container controls-bottom">
        {/* 再生／停止ボタン */}
        <button type="button" className="karaoke-button" onClick={handleTogglePlay}>
          {isPlaying ? "停止" : "再生"}
        </button>
        {/* リセット */}
        <button
          type="button"
          className="karaoke-button"
          onClick={handleStop}
          disabled={!isPlaying && currentTime === 0}
        >
          リセット
        </button>
        {/* １文／全文ボタン */}
        <button
          type="button"
          className={`karaoke-button ${isContinuousPlay ? "active" : ""}`}
          onClick={toggleContinuousPlay}
        >
          {isContinuousPlay ? "全文" : "１文"}
        </button>
        {/* 和訳ボタン */}
        <button
          type="button"
          className={`karaoke-button ${showWayaku ? "active" : "inactive"}`}
          onClick={handleToggleWayaku}
        >
          和訳
        </button>
        {/* カラオケ／シャドーボタン */}
        <button
          type="button"
          className={`karaoke-button ${isShadowMode ? "active" : "inactive"}`}
          onClick={handleToggleShadowMode}
        >
          シャドー
        </button>
      </div>

      {activeAudioUrl && (
        <audio ref={audioRef} src={activeAudioUrl} onEnded={handleAudioEnd}>
          <track kind="captions" />
        </audio>
      )}
    </div>
  );
};

export default Basic;
