// 単語情報の型定義
export interface WordInfo {
  word: string;
  start: number;
  duration: number;
}

// テキスト全体の型定義
export interface KaraokeText {
  text: string;
  words: WordInfo[];
  audioUrl: string;
}

export const sampleText: KaraokeText = {
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
  audioUrl: "https://audio.tatoeba.org/sentences/eng/7170951.mp3" // オーディオファイルのパス
};