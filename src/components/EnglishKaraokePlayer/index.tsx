import { useState, useRef, useCallback, useEffect } from 'react'; // useEffect を追加
import './index.css'; // 作成した CSS ファイルをインポート
import { sampleText, type KaraokeText, type WordInfo } from './data'; // data.ts からインポート

// 複数のカラオケデータを配列で管理
const karaokeData: KaraokeText[] = Array(5).fill(sampleText);

const EnglishKaraokePlayer = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0); // 現在のテキストインデックス
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentKaraokeText = karaokeData[currentTextIndex]; // 現在のカラオケテキスト

  // 時間追跡のアニメーションフレーム
  const startTimeTracking = useCallback(() => {
    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime ?? 0);
        // isPlaying が true の間だけ次のフレームを要求
        if (audioRef.current && !audioRef.current.paused) {
           animationFrameRef.current = requestAnimationFrame(updateTime);
        } else {
           animationFrameRef.current = null; // 停止したら null に
        }
      }
    };
    // 最初のフレームを要求
    animationFrameRef.current = requestAnimationFrame(updateTime);
  }, []); // 依存配列は空

  // 再生/停止ボタンのハンドラ: isPlaying ステートをトグルするだけ
  const togglePlay = useCallback(() => {
    setIsPlaying(prevIsPlaying => !prevIsPlaying);
  }, []); // 依存関係なし

  // オーディオ終了時の処理
  const handleAudioEnd = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    // 再生状態を false にし、時間をリセット
    setIsPlaying(false);
    setCurrentTime(0);

    // 次のテキストへ
    if (currentTextIndex < karaokeData.length - 1) {
      setCurrentTextIndex(currentTextIndex + 1);
    } else {
      setCurrentTextIndex(0); // 最後まで行ったら最初に戻る
    }
  }, [currentTextIndex]); // currentTextIndex に依存

  // テキストが変わった時に audio の src を更新
  useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = !audioRef.current.paused; // src 変更前に再生中だったか
      audioRef.current.src = currentKaraokeText.audioUrl;
      audioRef.current.load();
      setCurrentTime(0); // 時間をリセット
      if (animationFrameRef.current) { // アニメーションフレームは常にキャンセル
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // 曲が変わったら、ユーザーの再クリックを促すために再生状態をリセット
      if (wasPlaying) {
        setIsPlaying(false);
      }
    }
    // currentKaraokeText が変わるたびに実行（主に audioUrl の変更を検知）
  }, [currentKaraokeText.audioUrl]); // audioUrl の変更に依存

  // isPlaying ステートに基づいて再生/停止を実行
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().then(() => {
        startTimeTracking(); // 再生成功したら時間追跡開始
      }).catch(error => {
        console.error("Audio play failed:", error);
        setIsPlaying(false); // 失敗したら再生状態をリセット
      });
    } else {
      audioRef.current.pause();
      // アニメーションフレームのキャンセルは pause 時にも行う
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    // クリーンアップ関数: isPlaying が false になるか、コンポーネントがアンマウントされるときに pause する
    return () => {
      if (audioRef.current && !audioRef.current.paused) {
         // audioRef.current.pause(); // pause は isPlaying が false になったときに useEffect 内で実行されるため、ここでは不要かも
      }
      // アニメーションフレームは常にクリーンアップ
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying, startTimeTracking]); // isPlaying ステートと startTimeTracking コールバックに依存

  // 単語の進行度に基づいた部分ハイライト (変更なし)
  const getPartialHighlight = (word: WordInfo): number => {
    if (currentTime < word.start) return 0;
    if (currentTime >= word.start + word.duration) return 100;

    // currentTime が word.start と word.start + word.duration の間の場合
    const progress = (currentTime - word.start) / word.duration;
    return Math.min(progress * 100, 100);
  };

  return (
    <div className="karaoke-player">
      <div
        className="text-container"
        onClick={togglePlay}
        // biome-ignore lint: Using div with button role for text container clickability
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') togglePlay(); }}
        role="button"
        tabIndex={0}
      >
        {currentKaraokeText.words.map((word, index) => (
          <span key={`${currentKaraokeText.audioUrl}-${word.start}-${index}`} className="word-container"> {/* key に audioUrl を追加して一意性を高める */}
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
            {index < currentKaraokeText.words.length - 1 && " "}
          </span>
        ))}
      </div>

      <div className="controls">
        <button type="button" onClick={togglePlay}>
          {isPlaying ? "停止" : "再生"}
        </button>
      </div>

      {/* biome-ignore lint/a11y/useMediaCaption: キャプションは現時点では不要 */}
      <audio
        ref={audioRef}
        src={currentKaraokeText.audioUrl} // 現在のテキストの audioUrl を使用
        onEnded={handleAudioEnd} // onEnded プロパティで処理
      >
        {/* Biome: Provide a track for captions */}
        {/* Add src="path/to/captions.vtt" if you have caption file */}
      </audio>
    </div>
  );
}; // EnglishKaraokePlayer 関数の閉じ括弧

export default EnglishKaraokePlayer;
