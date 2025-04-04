import type React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';

// 単語の型定義
interface Word {
  word: string;
  start: number;
  duration: number;
}

const AdvancedKaraokeEditor = () => {
  const [text, setText] = useState("");
  const [words, setWords] = useState<Word[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(-1);
  const [isEditingText, setIsEditingText] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  // オーディオファイルのアップロード処理
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    // 既存のURLをクリーンアップ
    if (audioUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }

    // オーディオの長さを取得
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
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

    const newWords: Word[] = wordsArray.map((word, index) => {
      return {
        word,
        start: index * defaultDuration,
        duration: defaultDuration,
      };
    });

    setWords(newWords);
    setIsEditingText(false);
  };

  // 再生/停止の処理
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current?.pause();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    } else {
      audioRef.current?.play();
      startTimeTracking();
    }

    setIsPlaying(!isPlaying);
  };

  // 時間追跡のアニメーションフレーム
  const startTimeTracking = () => {
    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateTime);
  };

  // オーディオ終了時の処理
  const handleAudioEnd = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // 単語選択時の処理
  const selectWord = (index: number) => {
    setSelectedWordIndex(index);

    // 選択した単語の開始時間に移動
    if (audioRef.current && index >= 0 && index < words.length) {
      audioRef.current.currentTime = words[index].start;
      setCurrentTime(words[index].start);
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

    if (selectedWordIndex < words.length - 1) {
      const nextWord = newWords[selectedWordIndex + 1];
      if (nextWord) {
          const nextStart = nextWord.start;
          if (currentAudioTime >= nextStart) {
              nextWord.start = currentAudioTime + 0.1;
          }
      }
    }

    if (selectedWordIndex > 0) {
      const prevWord = newWords[selectedWordIndex - 1];
      if (prevWord) {
          const prevDuration = currentAudioTime - prevWord.start;
          if (prevDuration > 0) {
              prevWord.duration = prevDuration;
          } else {
              prevWord.start = currentAudioTime - 0.1;
              prevWord.duration = 0.1;
          }
      }
    }

    if (selectedWordIndex < words.length - 1) {
      const currentWordForDuration = newWords[selectedWordIndex];
      const nextWordForDuration = newWords[selectedWordIndex + 1];
      if (currentWordForDuration && nextWordForDuration) {
          currentWordForDuration.duration = nextWordForDuration.start - currentAudioTime;
      } else if (currentWordForDuration) {
          currentWordForDuration.duration = 1.0;
      }
    } else {
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
      duration: newDuration,
    };

    if (selectedWordIndex < words.length - 1) {
      const nextWord = newWords[selectedWordIndex + 1];
      if (nextWord && currentAudioTime > nextWord.start) {
        nextWord.start = currentAudioTime;
        if (selectedWordIndex + 1 < words.length - 1) {
            const nextNextWord = newWords[selectedWordIndex + 2];
            if (nextNextWord) {
                nextWord.duration = nextNextWord.start - nextWord.start;
            }
        } else {
            nextWord.duration = Math.max(0.1, audioDuration - nextWord.start);
        }
      }
    }

    setWords(newWords);
  };

  // タイムラインでの時間移動
  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = rect.width > 0 ? clickX / rect.width : 0;
    const newTime = percentage * audioDuration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [audioDuration]);

  // タイムライン上の単語位置を計算
  const getWordPosition = (word: Word) => {
    if (audioDuration <= 0) return { left: '0%', width: '0%' };

    const left = (word.start / audioDuration) * 100;
    const width = (word.duration / audioDuration) * 100;

    return { left: `${left}%`, width: `${Math.max(0.1, width)}%` };
  };

  // プレビューモードの切り替え
  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
    setSelectedWordIndex(-1);

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  // 単語の進行度に基づいた部分ハイライト
  const getPartialHighlight = (word: Word) => {
    if (currentTime < word.start) return 0;
    if (currentTime >= word.start + word.duration) return 100;

    const progress = word.duration > 0 ? (currentTime - word.start) / word.duration : 0;
    return Math.min(progress * 100, 100);
  };

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // プロジェクトのエクスポート
  const exportProject = () => {
    if (!words.length) return;

    const project = {
      text: words.map((w: Word) => w.word).join(' '),
      words,
      audioDuration
    };

    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'karaoke-project.json';
    a.click();

    URL.revokeObjectURL(url);
  };

  // プロジェクトのインポート
  const importProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const project = JSON.parse(result);
          if (project && typeof project === 'object' && Array.isArray(project.words)) {
             const validatedWords = project.words.filter(
               (w: unknown): w is Word => {
                 if (typeof w !== 'object' || w === null) {
                   return false;
                 }
                 const obj = w as Record<string, unknown>;
                 return (
                   typeof obj.word === 'string' &&
                   typeof obj.start === 'number' &&
                   typeof obj.duration === 'number'
                 );
               }
             );
            setWords(validatedWords);
            setText(project.text || validatedWords.map((w: Word) => w.word).join(' '));
            setAudioDuration(project.audioDuration || 0);
          } else {
             console.error('Invalid project file structure');
             alert('プロジェクトファイルの構造が無効です。');
          }
        } else {
           console.error('Failed to read file content as text');
           alert('ファイルの読み込みに失敗しました。');
        }
      } catch (error) {
        console.error('Failed to parse project file:', error);
        alert('プロジェクトファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="karaoke-editor">
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
          <div className="audio-controls">
            <button type="button" onClick={togglePlay}>
              {isPlaying ? "停止" : "再生"}
            </button>
            <div className="audio-info">
              長さ: {audioDuration.toFixed(2)}秒
            </div>
          </div>
        )}
      </div>

      {!audioUrl && (
        <div className="instructions">
          まず、音声ファイルをアップロードしてください。
        </div>
      )}

      {audioUrl && (
        <>
          {isEditingText ? (
            <div className="text-section">
              <h3>英文を入力</h3>
              <textarea
                value={text}
                onChange={handleTextChange}
                rows={4}
                placeholder="英文を入力してください..."
              />
              <div className="button-group">
                <button type="button" onClick={splitText}>分割して編集</button>
                <button type="button" onClick={() => setIsEditingText(false)}>キャンセル</button>
              </div>
            </div>
          ) : words.length === 0 ? (
            <div className="text-section">
              <button type="button" onClick={() => setIsEditingText(true)}>英文を入力</button>
            </div>
          ) : previewMode ? (
            <div className="preview-section">
              <h3>プレビュー</h3>
              {/* biome-ignore lint/a11y/useKeyWithClickEvents: Keyboard event handled */}
              {/* biome-ignore lint/a11y/useButtonType: Div used for layout, role added */}
              <div
                className="text-container"
                onClick={togglePlay}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') togglePlay(); }}
                role="button"
                tabIndex={0}
              >
                {words.map((word: Word, index: number) => (
                  <span key={`${word.word}-${index}`} className="word-container">
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
                    {index < words.length - 1 && " "}
                  </span>
                ))}
              </div>
              <button type="button" onClick={togglePreviewMode}>編集モードに戻る</button>
            </div>
          ) : (
            <div className="edit-section">
              <div className="controls-top">
                <button type="button" onClick={() => setIsEditingText(true)}>テキストを編集</button>
                <button type="button" onClick={togglePreviewMode}>プレビュー</button>
                <button type="button" onClick={exportProject}>プロジェクトを保存</button>
                <input
                  type="file"
                  accept=".json"
                  onChange={importProject}
                  style={{ display: 'none' }}
                  id="import-project"
                />
                <label htmlFor="import-project" className="button">
                  プロジェクトを読み込む
                </label>
              </div>

              <h3>タイミング編集</h3>
              <div className="timeline-container">
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: Keyboard event handled */}
                {/* biome-ignore lint/a11y/useButtonType: Div used for layout, role added */}
                <div
                  className="timeline"
                  ref={timelineRef}
                  onClick={handleTimelineClick}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTimelineClick(e as unknown as React.MouseEvent<HTMLDivElement>); }}
                  role="button"
                  tabIndex={0}
                >
                  <div
                    className="current-time-marker"
                    style={{ left: `${(currentTime / audioDuration) * 100}%` }}
                  />
                  {words.map((word: Word, index: number) => {
                    const { left, width } = getWordPosition(word);
                    return (
                      // biome-ignore lint/a11y/useKeyWithClickEvents: Keyboard event handled
                      // biome-ignore lint/a11y/useButtonType: Div used for layout, role added
                      <div
                        key={`${word.word}-${index}-block`}
                        className={`word-block ${selectedWordIndex === index ? 'selected' : ''}`}
                        style={{ left, width }}
                        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                          e.stopPropagation();
                          selectWord(index);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation();
                                selectWord(index);
                            }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="word-label">{word.word}</div>
                      </div>
                    );
                  })}
                </div> {/* timeline */}

                <div className="time-markers">
                  {Array.from({ length: Math.max(1, Math.ceil(audioDuration / 5)) + 1 }).map((_, i) => {
                      const time = i * 5;
                      if (time > audioDuration && i !== Math.ceil(audioDuration / 5)) return null;
                      const displayTime = Math.min(time, audioDuration);
                      return (
                          // biome-ignore lint/suspicious/noArrayIndexKey: Index is suitable for static list based on duration
                          <div key={i} className="time-marker" style={{ left: `${(displayTime / audioDuration) * 100}%` }}>
                              {displayTime.toFixed(1)}s
                          </div>
                      );
                  })}
                </div> {/* time-markers */}
              </div> {/* timeline-container */}

              <div className="word-edit-controls">
                {selectedWordIndex >= 0 && selectedWordIndex < words.length && (
                  <div className="word-info">
                    {words[selectedWordIndex] && (
                      <>
                        <div>
                          選択中: <b>{words[selectedWordIndex].word}</b>
                        </div>
                        <div>
                          開始: {words[selectedWordIndex].start.toFixed(2)}秒
                        </div>
                        <div>
                          長さ: {words[selectedWordIndex].duration.toFixed(2)}秒
                        </div>
                        <div className="button-group">
                          <button type="button" onClick={setWordStart}>開始時間を設定</button>
                          <button type="button" onClick={setWordEnd}>終了時間を設定</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div> {/* word-edit-controls */}

              <div className="words-list">
                <h4>単語リスト</h4>
                <div className="words-grid">
                  {words.map((word: Word, index: number) => (
                    // biome-ignore lint/a11y/useKeyWithClickEvents: Keyboard event handled
                    // biome-ignore lint/a11y/useButtonType: Div used for layout, role added
                    <div
                      key={`${word.word}-${index}-item`}
                      className={`word-item ${selectedWordIndex === index ? 'selected' : ''}`}
                      onClick={() => selectWord(index)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectWord(index); }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="word-text">{word.word}</div>
                      <div className="word-time">
                        {word.start.toFixed(2)}s - {(word.start + word.duration).toFixed(2)}s
                      </div>
                    </div>
                  ))}
                </div> {/* words-grid */}
              </div> {/* words-list */}
            </div> /* edit-section */
          )} {/* End of ternary for isEditingText/words.length/previewMode */}
        </>
      )} {/* End of audioUrl check */}

      <audio ref={audioRef} src={audioUrl} onEnded={handleAudioEnd}>
        <track kind="captions" />
      </audio>

    </div> // End of karaoke-editor div
  ); // End of return statement
}; // End of AdvancedKaraokeEditor component

export default AdvancedKaraokeEditor;
