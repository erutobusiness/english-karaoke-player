import { useState, useRef, useCallback, useEffect } from 'react';
import type { WordInfo } from '../components/EnglishKaraokePlayer/data';
// コールバックに渡すアクションの型
interface KaraokeActions {
  play: () => void;
  reset: () => void;
}

interface UseKaraokePlayerProps {
  audioUrl: string;
  words: WordInfo[];
  onEnded?: () => void; // 単一再生終了時 or 全文再生の最終行終了時
  onNextLine?: (actions: KaraokeActions) => void; // 引数を受け取るように変更
}
// 余分な括弧を削除

export const useKaraokePlayer = ({ audioUrl, onEnded, onNextLine }: UseKaraokePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isContinuousPlay, setIsContinuousPlay] = useState(false); // 全文再生フラグ
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

  // 再生を開始する関数
  const play = useCallback(() => {
    if (!audioRef.current) return;
    setIsPlaying(true);
    audioRef.current.pause();

    // 時間をおいて再生
    setTimeout(() => {
      if (!audioRef.current) return;
      audioRef.current.play().then(() => {
        startTimeTracking(); // 再生成功したら時間追跡開始
      });
    }, 0);
  }, [startTimeTracking]);

  // 再生を停止する関数
  const pause = useCallback(() => {
    if (!audioRef.current) return;
    setIsPlaying(false);
    audioRef.current.pause();
    cancelAnimationFrameIfExists(); // アニメーションフレームをキャンセル
  }, [cancelAnimationFrameIfExists]); // isPlaying に依存

  // 全文再生モードを切り替える関数
  const toggleContinuousPlay = useCallback(() => {
    setIsContinuousPlay(prev => !prev);
  }, []);

  // プレイヤーのリセット（外部から呼び出せるように）
  const reset = useCallback(() => {
    if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
    }
    cancelAnimationFrameIfExists();
  }, [cancelAnimationFrameIfExists]);

  // オーディオ終了時の処理 (play, reset の後に定義)
  const handleAudioEnd = useCallback(() => {
    cancelAnimationFrameIfExists();
    setIsPlaying(false);
    setCurrentTime(0); // 時間をリセット

    if (isContinuousPlay && onNextLine) {
      // 全文再生が有効で、次の行へ進むコールバックがあれば実行
      // play と reset を引数として渡す
      onNextLine({ play, reset });
    } else if (onEnded) {
      // 全文再生が無効、または最後の行で onNextLine がない場合、通常の onEnded を実行
      onEnded();
    }
  }, [isContinuousPlay, onNextLine, onEnded, cancelAnimationFrameIfExists, play, reset]);

  // audioUrl が変わった時に audio の src を更新
  useEffect(() => {
    if (audioRef.current) {
      // resetPlayer() を直接呼ばずに、必要な状態リセットを行う
      audioRef.current.src = audioUrl;
      audioRef.current.load(); // 新しいソースをロード
      setCurrentTime(0);       // 時間をリセット
      setIsPlaying(false);     // 再生状態を停止にリセット
      cancelAnimationFrameIfExists(); // アニメーションフレームもキャンセル
    }
  }, [audioUrl, cancelAnimationFrameIfExists]);

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
    isContinuousPlay,
    play,
    pause,
    reset,
    toggleContinuousPlay,
    getPartialHighlight,
    handleAudioEnd,
  };
};