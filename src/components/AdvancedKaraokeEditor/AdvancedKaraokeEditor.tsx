import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import "./AdvancedKaraokeEditor.css";
import { useKaraokePlayer } from "../../hooks/useKaraokePlayer";
import type { WordInfo } from "../EnglishKaraokePlayer/data";

// Word 型定義は削除し、WordInfo を使用

const AdvancedKaraokeEditor = () => {
  const [text, setText] = useState("");
  const [words, setWords] = useState<WordInfo[]>([]); // WordInfo 型を使用
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(-1);
  const [isEditingText, setIsEditingText] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const timelineRef = useRef<HTMLButtonElement | null>(null);

  const {
    audioRef,
    isPlaying,
    currentTime,
    play, // togglePlay の代わりに play を受け取る
    pause, // pause を受け取る
    getPartialHighlight,
    handleAudioEnd: hookHandleAudioEnd,
    reset: resetPlayer,
  } = useKaraokePlayer({
    audioUrl: audioUrl,
    words: words,
  });

  // 再生/停止を切り替える関数
  const handleTogglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  // オーディオファイルのアップロード処理
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const previousAudioUrl = audioUrl; // クリーンアップ用に保持

    setAudioUrl(url);

    // 既存の Blob URL をクリーンアップ
    if (previousAudioUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previousAudioUrl);
    }

    // オーディオの長さを取得
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      setAudioDuration(audio.duration);
    });
  };

  // テキスト変更時の処理
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  // テキストの分割処理
  const splitText = () => {
    if (!text.trim()) return;

    const wordsArray = text.trim().split(/\s+/);
    const defaultDuration = audioDuration > 0 ? audioDuration / wordsArray.length : 0.5;

    const newWords: WordInfo[] = wordsArray.map((word, index) => {
      return {
        word,
        start: index * defaultDuration,
        duration: defaultDuration,
      };
    });

    setWords(newWords);
    setIsEditingText(false);
  };

  // 単語選択時の処理
  const selectWord = (index: number) => {
    setSelectedWordIndex(index);

    // 選択した単語の開始時間に移動
    if (audioRef.current && index >= 0 && index < words.length) {
      audioRef.current.currentTime = words[index].start;
    }
  };

  // 単語の開始時間設定
  const setWordStart = () => {
    if (selectedWordIndex < 0 || !audioRef.current) return;

    const newWords = [...words];
    const currentAudioTime = audioRef.current.currentTime;

    const currentWord = newWords[selectedWordIndex];
    if (currentWord) {
      newWords[selectedWordIndex] = {
        ...currentWord,
        start: currentAudioTime,
      };
    }

    // Adjust next word's start time if needed
    if (selectedWordIndex < words.length - 1) {
      const nextWord = newWords[selectedWordIndex + 1];
      if (nextWord && currentAudioTime >= nextWord.start) {
        nextWord.start = currentAudioTime + 0.1; // Ensure next word starts after current
      }
    }

    // Adjust previous word's duration
    if (selectedWordIndex > 0) {
      const prevWord = newWords[selectedWordIndex - 1];
      if (prevWord) {
        const prevDuration = currentAudioTime - prevWord.start;
        if (prevDuration > 0) {
          prevWord.duration = prevDuration;
        } else {
          // Avoid negative duration, adjust previous word's start as well
          prevWord.start = currentAudioTime - 0.1;
          prevWord.duration = 0.1;
        }
      }
    }

    if (selectedWordIndex < words.length - 1) {
      const currentWordForDuration = newWords[selectedWordIndex];
      const nextWordForDuration = newWords[selectedWordIndex + 1];
      if (currentWordForDuration && nextWordForDuration) {
        currentWordForDuration.duration = Math.max(
          0.1,
          nextWordForDuration.start - currentWordForDuration.start
        );
      }
    } else {
      // For the last word, duration goes until the end of the audio
      const lastWord = newWords[selectedWordIndex];
      if (lastWord) {
        lastWord.duration = Math.max(0.1, audioDuration - lastWord.start);
      }
    }

    setWords(newWords);
  };

  // 単語の終了時間設定
  const setWordEnd = () => {
    if (selectedWordIndex < 0 || !audioRef.current) return;

    const newWords = [...words];
    const currentAudioTime = audioRef.current.currentTime;
    const selectedWord = newWords[selectedWordIndex];

    if (!selectedWord) return;

    if (currentAudioTime <= selectedWord.start) {
      alert("終了時間は開始時間より後に設定してください");
      return;
    }

    const newDuration = currentAudioTime - selectedWord.start;
    newWords[selectedWordIndex] = {
      ...selectedWord,
      duration: Math.max(0.1, newDuration), // Ensure minimum duration
    };

    // Adjust next word's start time if needed
    if (selectedWordIndex < words.length - 1) {
      const nextWord = newWords[selectedWordIndex + 1];
      if (nextWord && currentAudioTime > nextWord.start) {
        nextWord.start = currentAudioTime;
        // Recalculate next word's duration
        if (selectedWordIndex + 1 < words.length - 1) {
          const nextNextWord = newWords[selectedWordIndex + 2];
          if (nextNextWord) {
            nextWord.duration = Math.max(0.1, nextNextWord.start - nextWord.start);
          }
        } else {
          nextWord.duration = Math.max(0.1, audioDuration - nextWord.start);
        }
      }
    }

    setWords(newWords);
  };

  // タイムラインでの時間移動
  const handleTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!audioRef.current || !timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = rect.width > 0 ? clickX / rect.width : 0;
      const newTime = percentage * audioDuration;

      audioRef.current.currentTime = newTime;
    },
    [audioDuration, audioRef]
  );

  // タイムライン上の単語位置を計算
  const getWordPosition = (word: WordInfo) => {
    if (audioDuration <= 0) return { left: "0%", width: "0%" };

    const left = (word.start / audioDuration) * 100;
    const width = (word.duration / audioDuration) * 100;

    return { left: `${left}%`, width: `${Math.max(0.1, width)}%` }; // Ensure minimum width for visibility
  };

  // プレビューモードの切り替え
  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
    setSelectedWordIndex(-1);
    resetPlayer(); // フックのリセット関数を呼び出す
  };

  // getPartialHighlight はフックから取得するので削除

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      // animationFrameRef のクリーンアップはフック内で行われる
      if (audioUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // プロジェクトのエクスポート
  const exportProject = () => {
    if (!words.length) return;

    const project = {
      text: words.map((w: WordInfo) => w.word).join(" "), // WordInfo 型を使用
      words,
      audioDuration,
    };

    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "karaoke-project.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  // プロジェクトのインポート
  const importProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        const project = JSON.parse(result);
        if (project && typeof project === "object" && Array.isArray(project.words)) {
          const validatedWords = project.words.filter((w: unknown): w is WordInfo => {
            // WordInfo 型を使用
            if (typeof w !== "object" || w === null) {
              return false;
            }
            const obj = w as Record<string, unknown>;
            return (
              typeof obj.word === "string" &&
              typeof obj.start === "number" &&
              typeof obj.duration === "number"
            );
          });
          setWords(validatedWords);
          setText(project.text || validatedWords.map((w: WordInfo) => w.word).join(" ")); // WordInfo 型を使用
          setAudioDuration(project.audioDuration || 0);
          resetPlayer();
          setSelectedWordIndex(-1);
          setPreviewMode(false);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="karaoke-container">
      {" "}
      {/* Updated class name */}
      <h2>英語カラオケエディタ</h2>
      <div className="audio-section">
        <h3>音声ファイル</h3>
        <input
          type="file"
          accept="audio/*"
          ref={fileInputRef}
          onChange={handleAudioUpload}
          className="audio-input"
        />
        {audioUrl && (
          <div className="controls-container audio-controls">
            {" "}
            {/* Updated class name */}
            <button type="button" className="karaoke-button" onClick={handleTogglePlay}>
              {" "}
              {/* Use handleTogglePlay */}
              {isPlaying ? "停止" : "再生"}
            </button>
            <div className="audio-info">長さ: {audioDuration.toFixed(2)}秒</div>
          </div>
        )}
      </div>
      {!audioUrl && (
        <div className="instructions">まず、音声ファイルをアップロードしてください。</div>
      )}
      {audioUrl &&
        // 不要な Fragment を削除
        // <>
        (isEditingText ? (
          <div className="text-section">
            <h3>英文を入力</h3>
            <textarea
              value={text}
              onChange={handleTextChange}
              rows={4}
              placeholder="英文を入力してください..."
            />
            <div className="button-group">
              <button type="button" className="karaoke-button" onClick={splitText}>
                分割して編集
              </button>{" "}
              {/* Added class name */}
              <button
                type="button"
                className="karaoke-button"
                onClick={() => setIsEditingText(false)}
              >
                キャンセル
              </button>{" "}
              {/* Added class name */}
            </div>
          </div>
        ) : words.length === 0 ? (
          <div className="text-section">
            <button type="button" className="karaoke-button" onClick={() => setIsEditingText(true)}>
              英文を入力
            </button>{" "}
            {/* Added class name */}
          </div>
        ) : previewMode ? (
          <div className="preview-section">
            <h3>プレビュー</h3>
            <button
              type="button"
              className="karaoke-text-display" /* Updated class name */
              onClick={handleTogglePlay} /* Use handleTogglePlay */
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleTogglePlay();
              }} /* Use handleTogglePlay */
            >
              {words.map((word: WordInfo, index: number) => (
                <span key={`${word.word}-${index}`} className="karaoke-word-container">
                  <span className="karaoke-word">
                    <span
                      className="karaoke-highlight-layer"
                      style={{
                        width: `${getPartialHighlight(word)}%`,
                      }}
                    >
                      {word.word}
                    </span>
                    <span className="karaoke-original-text">{word.word}</span>
                  </span>
                  {index < words.length - 1 && " "}
                </span>
              ))}
            </button>
            <button type="button" className="karaoke-button" onClick={togglePreviewMode}>
              編集モードに戻る
            </button>{" "}
            {/* Added class name */}
          </div>
        ) : (
          <div className="edit-section">
            <div className="controls-container controls-top">
              {" "}
              {/* Updated class name */}
              <button
                type="button"
                className="karaoke-button"
                onClick={() => setIsEditingText(true)}
              >
                テキストを編集
              </button>{" "}
              {/* Added class name */}
              <button type="button" className="karaoke-button" onClick={togglePreviewMode}>
                プレビュー
              </button>{" "}
              {/* Added class name */}
              <button type="button" className="karaoke-button" onClick={exportProject}>
                プロジェクトを保存
              </button>{" "}
              {/* Added class name */}
              <input
                type="file"
                accept=".json"
                onChange={importProject}
                style={{ display: "none" }}
                id="import-project"
              />
              <label htmlFor="import-project" className="karaoke-button">
                {" "}
                {/* Updated class name */}
                プロジェクトを読み込む
              </label>
            </div>
            <h3>タイミング編集</h3>
            <div className="timeline-container">
              <button
                type="button"
                className="timeline"
                ref={timelineRef}
                onClick={handleTimelineClick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    handleTimelineClick(e as unknown as React.MouseEvent<HTMLButtonElement>);
                }}
              >
                <div
                  className="current-time-marker"
                  style={{
                    left: `${audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0}%`,
                  }}
                />
                {words.map((word: WordInfo, index: number) => {
                  const { left, width } = getWordPosition(word);
                  return (
                    <button
                      type="button"
                      key={`${word.word}-${index}-block`}
                      className={`word-block ${selectedWordIndex === index ? "selected" : ""}`}
                      style={{ left, width }}
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        selectWord(index);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          selectWord(index);
                        }
                      }}
                    >
                      <div className="word-label">{word.word}</div>
                    </button>
                  );
                })}
              </button>

              <div className="time-markers">
                {Array.from({ length: Math.max(1, Math.ceil(audioDuration / 5)) + 1 }).map(
                  (_, i) => {
                    const time = i * 5;
                    if (time > audioDuration && i !== Math.ceil(audioDuration / 5)) return null;
                    const displayTime = Math.min(time, audioDuration);
                    return (
                      // biome-ignore lint/suspicious/noArrayIndexKey: Index is suitable for static list based on duration
                      <div
                        key={i}
                        className="time-marker"
                        style={{
                          left: `${audioDuration > 0 ? (displayTime / audioDuration) * 100 : 0}%`,
                        }}
                      >
                        {displayTime.toFixed(1)}s
                      </div>
                    );
                  }
                )}
              </div>
            </div>
            <div className="word-edit-controls">
              {selectedWordIndex >= 0 &&
                selectedWordIndex < words.length &&
                words[selectedWordIndex] && (
                  <div className="word-info">
                    {/* Optional chaining for safety */}
                    <div>
                      選択中: <b>{words[selectedWordIndex]?.word}</b>
                    </div>
                    <div>開始: {words[selectedWordIndex]?.start.toFixed(2)}秒</div>
                    <div>長さ: {words[selectedWordIndex]?.duration.toFixed(2)}秒</div>
                    <div className="button-group">
                      <button type="button" className="karaoke-button" onClick={setWordStart}>
                        開始時間を設定
                      </button>{" "}
                      {/* Added class name */}
                      <button type="button" className="karaoke-button" onClick={setWordEnd}>
                        終了時間を設定
                      </button>{" "}
                      {/* Added class name */}
                    </div>
                  </div>
                )}
            </div>{" "}
            {/* word-edit-controls */}
            <div className="words-list">
              <h4>単語リスト</h4>
              <div className="words-grid">
                {words.map((word: WordInfo, index: number) => (
                  <button
                    type="button" // Add type="button"
                    key={`${word.word}-${index}-item`}
                    className={`word-item ${selectedWordIndex === index ? "selected" : ""}`}
                    onClick={() => selectWord(index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") selectWord(index);
                    }}
                  >
                    <div className="word-text">{word.word}</div>
                    <div className="word-time">
                      {word.start.toFixed(2)}s - {(word.start + word.duration).toFixed(2)}s
                    </div>
                  </button>
                ))}
              </div>{" "}
              {/* words-grid */}
            </div>{" "}
            {/* words-list */}
          </div> /* End of edit-section */
        ))}
      <audio ref={audioRef} src={audioUrl} onEnded={hookHandleAudioEnd} style={{ display: "none" }}>
        <track kind="captions" />
      </audio>
    </div>
  );
};

export default AdvancedKaraokeEditor;
