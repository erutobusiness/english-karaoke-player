import { useState, useRef, useCallback, useEffect } from 'react';

// EnglishKaraokePlayer/data.ts または CustomizableKaraokePlayer/index.tsx からインポートするか、
// 共通の型定義ファイルを作成してそこからインポートすることを検討
// ここでは仮に WordInfo 型を定義します
export interface WordInfo {
  word: string;
  start: number;
  duration: number;
}

interface UseKaraokePlayerProps {
  audioUrl: string;
  words: WordInfo[];
  onEnded?: () => void; // オプショナルな onEnded コールバック
}

export const useKaraokePlayer = ({ audioUrl, words, onEnded }: UseKaraokePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 時間追跡のアニメーションフレーム
  const startTimeTracking = useCallback(() => {
    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime ?? 0);
        // isPlaying が true の間だけ次のフレームを要求 (より安全なチェック)
        if (audioRef.current && !audioRef.current.paused && !audioRef.current.ended) {
           animationFrameRef.current = requestAnimationFrame(updateTime);
        } else {
           cancelAnimationFrameIfExists(); // 停止または終了したらキャンセル
        }
      }
    };
    cancelAnimationFrameIfExists(); // 開始前に既存のフレームをキャンセル
    animationFrameRef.current = requestAnimationFrame(updateTime);
  }, []); // 依存配列は空

  const cancelAnimationFrameIfExists = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []); // 依存配列は空でOK、ref の current へのアクセスは依存関係にならない

  // 再生/停止ボタンのハンドラ
  const togglePlay = useCallback(() => {
    setIsPlaying(prevIsPlaying => !prevIsPlaying);
  }, []);

  // オーディオ終了時の処理
  const handleAudioEnd = useCallback(() => {
    cancelAnimationFrameIfExists();
    setIsPlaying(false);
    setCurrentTime(0); // 時間をリセット
    // 外部から渡された onEnded コールバックを実行
    if (onEnded) {
      onEnded();
    }
  }, [onEnded, cancelAnimationFrameIfExists]); // cancelAnimationFrameIfExists を追加

  // プレイヤーのリセット（外部から呼び出せるように）
  const resetPlayer = useCallback(() => {
    if (audioRef.current) {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
    }
    cancelAnimationFrameIfExists();
  }, [isPlaying, cancelAnimationFrameIfExists]); // cancelAnimationFrameIfExists を追加

  // audioUrl が変わった時に audio の src を更新
  useEffect(() => {
    if (audioRef.current) {
      // resetPlayer() を直接呼ばずに、必要な状態リセットを行う
      audioRef.current.src = audioUrl;
      audioRef.current.load(); // 新しいソースをロード
      setCurrentTime(0);       // 時間をリセット
      setIsPlaying(false);     // 再生状態を停止にリセット
      cancelAnimationFrameIfExists(); // アニメーションフレームもキャンセル

      // wasPlaying のロジックは削除 (URL変更時は常に停止させるため)
    }
    // audioUrl が変わるたびに実行
    // resetPlayer と isPlaying を依存配列から削除
  }, [audioUrl, cancelAnimationFrameIfExists]);

  // isPlaying ステートに基づいて再生/停止を実行
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().then(() => {
        startTimeTracking(); // 再生成功したら時間追跡開始
      }).catch(error => {
        console.error("Audio play failed:", error);
        setIsPlaying(false); // 失敗したら再生状態をリセット
        cancelAnimationFrameIfExists(); // 念のためキャンセル
      });
    } else {
      // isPlaying が false になった場合、または初期状態
      if (!audioRef.current.paused) {
          audioRef.current.pause();
      }
      cancelAnimationFrameIfExists(); // アニメーションフレームをキャンセル
    }

    // クリーンアップ関数
    return () => {
      // コンポーネントのアンマウント時にもキャンセル
      cancelAnimationFrameIfExists();
      // アンマウント時に pause するかは議論の余地あり (audio 要素自体が消えるため不要かもしれない)
      // if (audioRef.current && !audioRef.current.paused) {
      //   audioRef.current.pause();
      // }
    };
  }, [isPlaying, startTimeTracking, cancelAnimationFrameIfExists]); // cancelAnimationFrameIfExists を追加

  // 単語の進行度に基づいた部分ハイライト
  const getPartialHighlight = useCallback((word: WordInfo): number => {
    if (currentTime < word.start) return 0;
    if (currentTime >= word.start + word.duration) return 100;

    // currentTime が word.start と word.start + word.duration の間の場合
    const progress = word.duration > 0 ? (currentTime - word.start) / word.duration : 0; // Avoid division by zero
    return Math.min(progress * 100, 100);
  }, [currentTime]); // currentTime に依存

  return {
    audioRef,
    currentTime,
    isPlaying,
    togglePlay,
    getPartialHighlight,
    handleAudioEnd, // audio 要素の onEnded に渡すため公開
    resetPlayer,    // 外部からリセットできるように公開
  };
};