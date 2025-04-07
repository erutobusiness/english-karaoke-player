import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import './index.css'; // Import the CSS file
import { useKaraokePlayer, type WordInfo } from '../../hooks/useKaraokePlayer';

interface Sample {
  id: number;
  text: string;
  words: WordInfo[];
  audioUrl: string;
}

// サンプルデータ
const initialSamples: Sample[] = [
  {
    id: 1,
    text: "This is an example of English text with karaoke-style animation.",
    words: [
      { word: "This", start: 0, duration: 0.5 },
      { word: "is", start: 0.5, duration: 0.3 },
      { word: "an", start: 0.8, duration: 0.3 },
      { word: "example", start: 1.1, duration: 0.7 },
      { word: "of", start: 1.8, duration: 0.3 },
      { word: "English", start: 2.1, duration: 0.6 },
      { word: "text", start: 2.7, duration: 0.5 },
      { word: "with", start: 3.2, duration: 0.4 },
      { word: "karaoke-style", start: 3.6, duration: 1.2 },
      { word: "animation.", start: 4.8, duration: 1.0 }
    ],
    audioUrl: "/sample-audio.mp3" // Ensure this path is correct relative to your public folder
  },
  {
    id: 2,
    text: "Learning English can be fun with interactive exercises.",
    words: [
      { word: "Learning", start: 0, duration: 0.6 },
      { word: "English", start: 0.6, duration: 0.5 },
      { word: "can", start: 1.1, duration: 0.3 },
      { word: "be", start: 1.4, duration: 0.2 },
      { word: "fun", start: 1.6, duration: 0.4 },
      { word: "with", start: 2.0, duration: 0.3 },
      { word: "interactive", start: 2.3, duration: 0.8 },
      { word: "exercises.", start: 3.1, duration: 0.9 }
    ],
    audioUrl: "/sample-audio2.mp3" // Ensure this path is correct relative to your public folder
  },
  {
    id: 3,
    text: "I know that Tom would never lie to Mary.",
    words: [
      { word: "I", start: 0, duration: 0.2 },
      { word: "know", start: 0.2, duration: 0.4 },
      { word: "that", start: 0.6, duration: 0.3 },
      { word: "Tom", start: 0.9, duration: 0.4 },
      { word: "would", start: 1.3, duration: 0.4 },
      { word: "never", start: 1.7, duration: 0.5 },
      { word: "lie", start: 2.2, duration: 0.4 },
      { word: "to", start: 2.6, duration: 0.2 },
      { word: "Mary.", start: 2.8, duration: 0.5 }
    ],
    audioUrl: "https://audio.tatoeba.org/sentences/eng/7170951.mp3" // External URL example
  }
];

const CustomizableKaraokePlayer = () => {
  const [samples, setSamples] = useState<Sample[]>(initialSamples);
  const [selectedSample, setSelectedSample] = useState<Sample>(initialSamples[2]);
  // isPlaying と currentTime はフックから取得するので削除
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedText, setEditedText] = useState<string>("");

  // audioRef と animationFrameRef はフックから取得するので削除
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // useKaraokePlayer フックを使用
  const {
    audioRef,
    isPlaying,
    togglePlay,
    getPartialHighlight,
    handleAudioEnd: hookHandleAudioEnd, // フックの onEnded ハンドラ
    resetPlayer: hookResetPlayer,      // フックのリセット関数
  } = useKaraokePlayer({
    // selectedSample が null の可能性を考慮 (初期レンダリングなど)
    audioUrl: selectedSample?.audioUrl ?? "",
    words: selectedSample?.words ?? [],
    // このコンポーネントでは曲が終わっても自動で次に進まないので onEnded はシンプルにリセットのみ
    onEnded: () => {
        // 必要であれば追加の処理
        console.log("Track ended in CustomizableKaraokePlayer");
    }
  });

  // サンプル選択時の処理
  const handleSampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number.parseInt(e.target.value, 10);
    const sample = samples.find(s => s.id === selectedId);
    if (sample) {
      setSelectedSample(sample);
      hookResetPlayer();
    }
  };

  // 編集モードの切り替え
  const toggleEditMode = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      setEditedText(selectedSample.text);
      setIsEditing(true);
      hookResetPlayer();
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

    const newWordsData: WordInfo[] = wordsArray.map((word, index) => { // WordInfo 型を使用
      return {
        word,
        start: index * 0.5, // Simple timing assumption
        duration: 0.5      // Simple timing assumption
      };
    });

    const newSample: Sample = {
      id: samples.length > 0 ? Math.max(...samples.map(s => s.id)) + 1 : 1, // Generate unique ID
      text: editedText,
      words: newWordsData,
      audioUrl: "" // Needs audio upload or default
    };

    setSamples([...samples, newSample]);
    setSelectedSample(newSample);
    setIsEditing(false);
    hookResetPlayer();
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
    setSamples(samples.map(s => s.id === selectedSample.id ? updatedSample : s));

    hookResetPlayer();
  };

  // コンポーネントのクリーンアップ
  useEffect(() => {
    // Clean up object URLs created for uploaded audio files
    const objectUrls = samples
      .map(s => s.audioUrl)
      .filter(url => url.startsWith('blob:'));

    return () => {
      // animationFrameRef のクリーンアップはフック内で行われる
      for (const url of objectUrls) { // Use for...of loop
        URL.revokeObjectURL(url);
      }
    };
  }, [samples]); // Depend on samples to clean up URLs when samples change

  return (
    <div className="karaoke-player">
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
            <button type="button" onClick={saveNewSample}>保存</button>
            <button type="button" onClick={toggleEditMode}>キャンセル</button>
          </div>
        </div>
      ) : (
        <>
          <div className="controls-top">
            <select value={selectedSample.id} onChange={handleSampleChange}>
              {samples.map(sample => (
                <option key={sample.id} value={sample.id}>
                  {sample.text.substring(0, 30)}...
                </option>
              ))}
            </select>
            <button type="button" onClick={toggleEditMode}>新しいテキストを作成</button>
          </div>

          <button
            type="button" // Add type="button"
            className="text-container"
            onClick={togglePlay} // フックから取得した togglePlay を使用
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') togglePlay(); }} // フックから取得した togglePlay を使用
          >
            {selectedSample?.words?.map((word, index) => ( // selectedSample が null の可能性を考慮
              <span key={`${selectedSample.id}-${index}`} className="word-container"> {/* Use more stable key */}
                <span className="word">
                  <span
                    className="highlight"
                    style={{
                      // フックから取得した getPartialHighlight を使用
                      width: `${getPartialHighlight(word)}%`
                    }}
                  >
                    {word.word}
                  </span>
                  <span className="original">
                    {word.word}
                  </span>
                </span>
                {/* selectedSample が null の可能性を考慮 */}
                {selectedSample?.words && index < selectedSample.words.length - 1 && " "}
              </span>
            ))}
          </button>

          <div className="controls">
            <button type="button" onClick={togglePlay}> {/* フックから取得した togglePlay を使用 */}
              {isPlaying ? "停止" : "再生"} {/* フックから取得した isPlaying を使用 */}
            </button>
            <input
              type="file"
              accept="audio/*"
              ref={fileInputRef}
              onChange={handleAudioUpload}
              style={{ display: 'none' }}
            />
            <button type="button" onClick={() => fileInputRef.current?.click()}>
              音声をアップロード
            </button>
          </div>
        </>
      )}

      <audio
        ref={audioRef} // フックから取得した audioRef を使用
        src={selectedSample?.audioUrl ?? ""} // selectedSample が null の可能性を考慮
        onEnded={hookHandleAudioEnd} // フックから取得した onEnded ハンドラを使用
      >
        <track kind="captions" />
      </audio>
    </div>
  );
};

export default CustomizableKaraokePlayer;
