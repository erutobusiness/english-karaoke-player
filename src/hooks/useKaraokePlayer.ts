import { useState, useRef, useCallback, useEffect } from 'react';
import type { WordInfo } from '../components/EnglishKaraokePlayer/data';

interface UseKaraokePlayerProps {
  audioUrl: string;
  words: WordInfo[];
  onEnded?: () => void;
}

export const useKaraokePlayer = ({ audioUrl, onEnded }: UseKaraokePlayerProps) => {
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

  // オーディオ終了時の処理
  const handleAudioEnd = useCallback(() => {
    cancelAnimationFrameIfExists();
    setIsPlaying(false);
    setCurrentTime(0);
    if (onEnded) { onEnded(); }
  }, [onEnded, cancelAnimationFrameIfExists]); // cancelAnimationFrameIfExists を追加

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
    play,         // togglePlay の代わりに play を公開
    pause,        // pause を公開
    reset,    // 外部からリセットできるように公開
    getPartialHighlight,
    handleAudioEnd, // audio 要素の onEnded に渡すため公開
  };
};