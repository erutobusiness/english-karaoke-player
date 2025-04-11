import { useCallback, useEffect, useRef, useState } from "react";
import type { WordInfo } from "../components/Basic/data";

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
  onWordChange?: (wordIndex: number) => void; // 現在の単語が変わったときのコールバック
}
// 余分な括弧を削除

export const useKaraokePlayer = ({
  audioUrl,
  words,
  onEnded,
  onNextLine,
  onWordChange,
}: UseKaraokePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isContinuousPlay, setIsContinuousPlay] = useState(false); // 全文再生フラグ
  const [currentWordIndex, setCurrentWordIndex] = useState(0); // 現在の単語インデックス
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const cancelAnimationFrameIfExists = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // 時間追跡のアニメーションフレーム
  const startTimeTracking = useCallback(() => {
    const updateTime = () => {
      if (audioRef.current) {
        const newTime = audioRef.current.currentTime ?? 0;
        setCurrentTime(newTime);
        if (audioRef.current && !audioRef.current.paused && !audioRef.current.ended) {
          animationFrameRef.current = requestAnimationFrame(updateTime);
        } else {
          cancelAnimationFrameIfExists();
        }
      }
    };
    cancelAnimationFrameIfExists(); // 開始前に既存のフレームをキャンセル
    animationFrameRef.current = requestAnimationFrame(updateTime);
  }, [cancelAnimationFrameIfExists]);

  // 再生を開始する関数
  const play = useCallback(() => {
    if (!audioRef.current) return;
    setIsPlaying(true);
    audioRef.current.pause();

    // 時間をおいて再生
    setTimeout(() => {
      if (!audioRef.current) return;
      audioRef.current
        .play()
        .then(() => {
          startTimeTracking();
        })
        .catch(() => {
          setIsPlaying(false); // エラー時は再生状態をリセット
        });
    }, 0);
  }, [startTimeTracking]);

  // 再生を停止する関数
  const pause = useCallback(() => {
    if (!audioRef.current) return;
    setIsPlaying(false);
    audioRef.current.pause();
    cancelAnimationFrameIfExists();
  }, [cancelAnimationFrameIfExists]);

  // 全文再生モードを切り替える関数
  const toggleContinuousPlay = useCallback(() => {
    setIsContinuousPlay((prev) => !prev);
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
    if (!isContinuousPlay) {
      // 全文再生中でなければ false にする
      setIsPlaying(false);
    }
    setCurrentTime(0); // 時間をリセット

    if (isContinuousPlay && onNextLine) {
      onNextLine({ play, reset });
    } else if (onEnded) {
      onEnded();
    }
  }, [isContinuousPlay, onNextLine, onEnded, cancelAnimationFrameIfExists, play, reset]);

  // audioUrl が変わった時に audio の src を更新
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [audioUrl]);

  // 単語の進行度に基づいた部分ハイライト
  const getPartialHighlight = useCallback(
    (word: WordInfo): number => {
      if (currentTime < word.start) return 0;
      if (currentTime >= word.start + word.duration) return 100;

      // currentTime が word.start と word.start + word.duration の間の場合
      const progress = word.duration > 0 ? (currentTime - word.start) / word.duration : 0; // Avoid division by zero
      return Math.min(progress * 100, 100);
    },
    [currentTime]
  );

  // 現在の時間に基づいて、アクティブな単語を特定する
  useEffect(() => {
    if (!words || words.length === 0) return;

    let newWordIndex = -1;
    for (let i = 0; i < words.length; i++) {
      if (
        currentTime >= words[i].start &&
        (currentTime < words[i].start + words[i].duration || i === words.length - 1)
      ) {
        newWordIndex = i;
        break;
      }
    }

    // words[0].startよりも前の時間の場合は最初の単語をアクティブにする
    if (newWordIndex === -1 && currentTime < words[0].start) {
      newWordIndex = 0;
    }

    // 単語インデックスが変わった場合のみ更新
    if (newWordIndex !== -1 && newWordIndex !== currentWordIndex) {
      setCurrentWordIndex(newWordIndex);
      if (onWordChange) {
        onWordChange(newWordIndex);
      }
    }
  }, [currentTime, words, currentWordIndex, onWordChange]);

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
