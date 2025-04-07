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

export const karaokeData: KaraokeText[] = [
  {
    text: "I know that Tom would never lie to Mary.",
    words: [
      { word: "I", start: 0, duration: 0.2 },
      { word: "know", start: 0.2, duration: 0.4 },
      { word: "that", start: 0.6, duration: 0.3 },
      { word: "Tom", start: 0.9, duration: 0.3 },
      { word: "would", start: 1.2, duration: 0.1 },
      { word: "never", start: 1.3, duration: 0.4 },
      { word: "lie", start: 1.7, duration: 0.4 },
      { word: "to", start: 2.1, duration: 0.1 },
      { word: "Mary.", start: 2.2, duration: 0.5 }
    ],
    audioUrl: "https://audio.tatoeba.org/sentences/eng/7170951.mp3" // オーディオファイルのパス
  },
  {
    text: "Will we really be able to do that that way?",
    words: [
      // 注: start と duration は仮の値です。実際の音声に合わせて調整が必要です。
      { word: "Will", start: 0, duration: 0.3 },
      { word: "we", start: 0.3, duration: 0.2 },
      { word: "really", start: 0.5, duration: 0.4 },
      { word: "be", start: 0.9, duration: 0.2 },
      { word: "able", start: 1.1, duration: 0.3 },
      { word: "to", start: 1.4, duration: 0.1 },
      { word: "do", start: 1.5, duration: 0.2 },
      { word: "that", start: 1.7, duration: 0.3 },
      { word: "that", start: 2.0, duration: 0.3 },
      { word: "way?", start: 2.3, duration: 0.4 }
    ],
    audioUrl: "https://audio.tatoeba.org/sentences/eng/9423819.mp3"
  }
];

// オーディオファイルを事前にロードする
const preload = () => {
  const audio = new Audio();
  for (const data of karaokeData) {
    audio.src = data.audioUrl;
    audio.load();
  }
}
preload();