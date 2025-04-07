import { useState, useCallback } from 'react';
import { karaokeData } from './data';
import { useKaraokePlayer } from '../../hooks/useKaraokePlayer';

const EnglishKaraokePlayer = () => {
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);

  // アクティブなアイテムのデータを取得（なければデフォルト値）
  const activeKaraokeData = karaokeData[activeItemIndex]; // null チェック不要
  const activeAudioUrl = activeKaraokeData?.audioUrl ?? '';
  const activeWords = activeKaraokeData?.words ?? [];

  // useKaraokePlayer フックを一つだけ使用
  const {
    audioRef,
    isPlaying,
    play,
    pause,
    reset,
    getPartialHighlight,
    handleAudioEnd,
  } = useKaraokePlayer({
    audioUrl: activeAudioUrl,
    words: activeWords,
  });

  // クリックハンドラ: アクティブなインデックスを更新し、常にリセット＆再生
  const handleActivate = useCallback((index: number) => {
    reset();
    setActiveItemIndex(index);
    setTimeout(() => { play(); }, 100);
  }, [reset, play]);

  // 再生/停止を切り替える関数
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  // 停止ボタンのハンドラ
  const handleStop = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div className="karaoke-container single-box-inline">
      <div className="karaoke-text-display">
        {karaokeData.map((item, itemIndex) => (
          <span
            key={item.audioUrl}
            className={`karaoke-sentence ${itemIndex === activeItemIndex ? 'active' : ''}`}
            onClick={() => handleActivate(itemIndex)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleActivate(itemIndex); }}
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
                      // アクティブな文章の単語のみハイライト
                      width: `${itemIndex === activeItemIndex ? getPartialHighlight(word) : 0}%`
                    }}
                  >
                    {word.word}
                  </span>
                </span>
                {' '} {/* 単語間にスペース */}
              </span>
            ))}
             {/* 文章間にスペースを追加 (自己終了タグに修正) */}
             {itemIndex < karaokeData.length - 1 && <span style={{marginRight: '0.5em'}} />}
          </span>
        ))}
      </div>

      {/* コントロールボタン (常に表示) */}
      <div className="controls-container controls-bottom"> {/* Updated class name */}
        <button
          type="button"
          className="karaoke-button"
          onClick={handleTogglePlay}
          // disabled 属性を削除
        >
          {isPlaying ? "一時停止" : "再生"}
        </button>
        <button
          type="button"
          className="karaoke-button"
          onClick={handleStop}
          // disabled 属性を削除
        >
          停止
        </button>
      </div>

      {/* audio 要素は一つだけ */}
      {activeAudioUrl && ( // activeAudioUrl が存在する場合のみ audio 要素をレンダリング
        <audio
          ref={audioRef}
          src={activeAudioUrl}
          onEnded={handleAudioEnd} // 再生終了時にアクティブ解除するハンドラ
        >
          <track kind='captions' />
        </audio>
      )}
    </div>
  );
};

export default EnglishKaraokePlayer;
