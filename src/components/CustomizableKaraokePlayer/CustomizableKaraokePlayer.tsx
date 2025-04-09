import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useKaraokePlayer } from "../../hooks/useKaraokePlayer";
import { type KaraokeText, type WordInfo, karaokeData } from "../EnglishKaraokePlayer/data";

const CustomizableKaraokePlayer = () => {
  const [samples, setSamples] = useState<KaraokeText[]>(karaokeData);
  const [selectedSample, setSelectedSample] = useState<KaraokeText>(karaokeData[0]);
  // isPlaying と currentTime はフックから取得するので削除
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedText, setEditedText] = useState<string>("");

  // audioRef と animationFrameRef はフックから取得するので削除
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // useKaraokePlayer フックを使用
  const { audioRef, isPlaying, play, pause, reset, getPartialHighlight, handleAudioEnd } =
    useKaraokePlayer({
      // selectedSample が null の可能性を考慮 (初期レンダリングなど)
      audioUrl: selectedSample?.audioUrl ?? "",
      words: selectedSample?.words ?? [],
      // このコンポーネントでは曲が終わっても自動で次に進まないので onEnded はシンプルにリセットのみ
      onEnded: () => {
        // 必要であれば追加の処理
        console.log("Track ended in CustomizableKaraokePlayer");
      },
    });

  // 再生/停止を切り替える関数
  const handleTogglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  // 停止ボタンのハンドラ
  const handleStop = () => {
    pause(); // 再生を停止
    reset(); // 再生位置をリセット
  };

  // サンプル選択時の処理
  const handleSampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sample = samples.find((s) => s.text === e.target.value);
    if (sample) {
      setSelectedSample(sample);
      reset(); // サンプル変更時もリセット
    }
  };

  // 編集モードの切り替え
  const toggleEditMode = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      setEditedText(selectedSample.text);
      setIsEditing(true);
      reset();
    }
  };

  // テキスト変更時の処理
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedText(e.target.value);
  };

  // 新しいサンプルの保存
  const saveNewSample = () => {
    if (!editedText.trim()) return;

    const wordsArray = editedText.trim().split(/\s+/);
    // const totalDuration = wordsArray.length * 0.5; // Unused variable (TS6133)

    const newWordsData: WordInfo[] = wordsArray.map((word, index) => {
      // WordInfo 型を使用
      return {
        word,
        start: index * 0.5, // Simple timing assumption
        duration: 0.5, // Simple timing assumption
      };
    });

    const newSample: KaraokeText = {
      text: editedText,
      words: newWordsData,
      audioUrl: "", // Needs audio upload or default
    };

    setSamples([...samples, newSample]);
    setSelectedSample(newSample);
    setIsEditing(false);
    reset();
  };

  // オーディオファイルのアップロード処理
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const audioUrl = URL.createObjectURL(file);

    // Update the selected sample's audio URL
    const updatedSample = { ...selectedSample, audioUrl };
    setSelectedSample(updatedSample);

    // Update the sample in the samples list as well
    setSamples(samples.map((s) => (s.text === selectedSample.text ? updatedSample : s)));

    reset();
  };

  // コンポーネントのクリーンアップ
  useEffect(() => {
    // Clean up object URLs created for uploaded audio files
    const objectUrls = samples.map((s) => s.audioUrl).filter((url) => url.startsWith("blob:"));

    return () => {
      // animationFrameRef のクリーンアップはフック内で行われる
      for (const url of objectUrls) {
        // Use for...of loop
        URL.revokeObjectURL(url);
      }
    };
  }, [samples]); // Depend on samples to clean up URLs when samples change

  return (
    <div className="karaoke-container">
      {" "}
      {/* Updated class name */}
      {isEditing ? (
        <div className="edit-panel">
          <h3>テキストを編集</h3>
          <textarea
            value={editedText}
            onChange={handleTextChange}
            rows={5}
            cols={50}
            placeholder="英文を入力してください..."
          />
          <div className="button-group">
            <button type="button" className="karaoke-button" onClick={saveNewSample}>
              保存
            </button>{" "}
            {/* Added class name */}
            <button type="button" className="karaoke-button" onClick={toggleEditMode}>
              キャンセル
            </button>{" "}
            {/* Added class name */}
          </div>
        </div>
      ) : (
        <>
          <div className="controls-container controls-top">
            {" "}
            {/* Updated class name */}
            <select value={selectedSample.text} onChange={handleSampleChange}>
              {samples.map((sample) => (
                <option key={sample.text} value={sample.text}>
                  {sample.text.substring(0, 30)}...
                </option>
              ))}
            </select>
            <button type="button" className="karaoke-button" onClick={toggleEditMode}>
              新しいテキストを作成
            </button>{" "}
            {/* Added class name */}
          </div>

          <button
            type="button" // Add type="button"
            className="karaoke-text-display" /* Updated class name */
            onClick={handleTogglePlay} /* Use handleTogglePlay */
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleTogglePlay();
            }} /* Use handleTogglePlay */
          >
            {selectedSample?.words?.map(
              (
                word,
                index // selectedSample が null の可能性を考慮
              ) => (
                <span key={`${selectedSample.text}-${index}`} className="karaoke-word-container">
                  <span className="karaoke-word">
                    <span
                      className="karaoke-highlight-layer"
                      style={{
                        // フックから取得した getPartialHighlight を使用
                        width: `${getPartialHighlight(word)}%`,
                      }}
                    >
                      {word.word}
                    </span>
                    <span className="karaoke-original-text">{word.word}</span>
                  </span>
                  {/* selectedSample が null の可能性を考慮 */}
                  {selectedSample?.words && index < selectedSample.words.length - 1 && " "}
                </span>
              )
            )}
          </button>

          <div className="controls-container controls-bottom">
            {" "}
            {/* Updated class name */}
            <button type="button" className="karaoke-button" onClick={handleTogglePlay}>
              {" "}
              {/* Use handleTogglePlay */}
              {isPlaying ? "一時停止" : "再生"} {/* ラベルをより正確に */}
            </button>
            {/* 停止ボタンを追加 */}
            <button type="button" className="karaoke-button" onClick={handleStop}>
              停止
            </button>
            <input
              type="file"
              accept="audio/*"
              ref={fileInputRef}
              onChange={handleAudioUpload}
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="karaoke-button"
              onClick={() => fileInputRef.current?.click()}
            >
              {" "}
              {/* Added class name */}
              音声をアップロード
            </button>
          </div>
        </>
      )}
      <audio
        ref={audioRef} // フックから取得した audioRef を使用
        src={selectedSample?.audioUrl ?? ""} // selectedSample が null の可能性を考慮
        onEnded={handleAudioEnd} // フックから取得した onEnded ハンドラを使用
      >
        <track kind="captions" />
      </audio>
    </div>
  );
};

export default CustomizableKaraokePlayer;
