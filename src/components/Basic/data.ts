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
  wayaku?: string; // 和訳を追加
  widthAdjustment?: number; // 文末に追加するspanの幅（px）
}

// tatoeba.org から取得したサンプルデータ
// https://tatoeba.org/ja/sentences/search?from=eng&has_audio=yes&list=&native=&original=&orphans=no&query=&sort=words&sort_reverse=yes&tags=&to=jpn&trans_filter=limit&trans_has_audio=&trans_link=&trans_orphan=&trans_to=&trans_unapproved=&trans_user=&unapproved=no&user=&word_count_max=&word_count_min=16

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
      { word: "Mary.", start: 2.2, duration: 0.5 },
    ],
    audioUrl: "https://audio.tatoeba.org/sentences/eng/7170951.mp3",
    wayaku: "私はトムがメアリーに嘘をつくことはないと知っています。",
    widthAdjustment: 20,
  },
  {
    text: "Will we really be able to do that that way?",
    words: [
      { word: "Will", start: 0, duration: 0.3 },
      { word: "we", start: 0.3, duration: 0.2 },
      { word: "really", start: 0.5, duration: 0.4 },
      { word: "be", start: 0.9, duration: 0.2 },
      { word: "able", start: 1.1, duration: 0.3 },
      { word: "to", start: 1.4, duration: 0.1 },
      { word: "do", start: 1.5, duration: 0.2 },
      { word: "that", start: 1.7, duration: 0.3 },
      { word: "that", start: 2.0, duration: 0.3 },
      { word: "way?", start: 2.3, duration: 0.4 },
    ],
    audioUrl: "https://audio.tatoeba.org/sentences/eng/9423819.mp3",
    wayaku: "本当にその方法でそれができるのでしょうか？",
    widthAdjustment: 4,
  },
  {
    text: "Doubtless there exists in this world precisely the right woman for any given man to marry and vice versa; but when you consider that a human being has the opportunity of being acquainted with only a few hundred people, and out of the few hundred that there are but a dozen or less whom he knows intimately, and out of the dozen, one or two friends at most, it will easily be seen, when we remember the number of millions who inhabit this world, that probably, since the earth was created, the right man has never yet met the right woman.",
    words: [
      // 注: start と duration は仮の値です。実際の音声に合わせて調整が必要です。
      { word: "Doubtless", start: 0, duration: 0.1 },
      { word: "there", start: 0.1, duration: 0.1 },
      { word: "exists", start: 0.2, duration: 0.1 },
      { word: "in", start: 0.3, duration: 0.1 },
      { word: "this", start: 0.4, duration: 0.1 },
      { word: "world", start: 0.5, duration: 0.1 },
      { word: "precisely", start: 0.6, duration: 0.1 },
      { word: "the", start: 0.7, duration: 0.1 },
      { word: "right", start: 0.8, duration: 0.1 },
      { word: "woman", start: 0.9, duration: 0.1 },
      { word: "for", start: 1.0, duration: 0.1 },
      { word: "any", start: 1.1, duration: 0.1 },
      { word: "given", start: 1.2, duration: 0.1 },
      { word: "man", start: 1.3, duration: 0.1 },
      { word: "to", start: 1.4, duration: 0.1 },
      { word: "marry", start: 1.5, duration: 0.1 },
      { word: "and", start: 1.6, duration: 0.1 },
      { word: "vice", start: 1.7, duration: 0.1 },
      { word: "versa;", start: 1.8, duration: 0.1 },
      { word: "but", start: 1.9, duration: 0.1 },
      { word: "when", start: 2.0, duration: 0.1 },
      { word: "you", start: 2.1, duration: 0.1 },
      { word: "consider", start: 2.2, duration: 0.1 },
      { word: "that", start: 2.3, duration: 0.1 },
      { word: "a", start: 2.4, duration: 0.1 },
      { word: "human", start: 2.5, duration: 0.1 },
      { word: "being", start: 2.6, duration: 0.1 },
      { word: "has", start: 2.7, duration: 0.1 },
      { word: "the", start: 2.8, duration: 0.1 },
      { word: "opportunity", start: 2.9, duration: 0.1 },
      { word: "of", start: 3.0, duration: 0.1 },
      { word: "being", start: 3.1, duration: 0.1 },
      { word: "acquainted", start: 3.2, duration: 0.1 },
      { word: "with", start: 3.3, duration: 0.1 },
      { word: "only", start: 3.4, duration: 0.1 },
      { word: "a", start: 3.5, duration: 0.1 },
      { word: "few", start: 3.6, duration: 0.1 },
      { word: "hundred", start: 3.7, duration: 0.1 },
      { word: "people,", start: 3.8, duration: 0.1 },
      { word: "and", start: 3.9, duration: 0.1 },
      { word: "out", start: 4.0, duration: 0.1 },
      { word: "of", start: 4.1, duration: 0.1 },
      { word: "the", start: 4.2, duration: 0.1 },
      { word: "few", start: 4.3, duration: 0.1 },
      { word: "hundred", start: 4.4, duration: 0.1 },
      { word: "that", start: 4.5, duration: 0.1 },
      { word: "there", start: 4.6, duration: 0.1 },
      { word: "are", start: 4.7, duration: 0.1 },
      { word: "but", start: 4.8, duration: 0.1 },
      { word: "a", start: 4.9, duration: 0.1 },
      { word: "dozen", start: 5.0, duration: 0.1 },
      { word: "or", start: 5.1, duration: 0.1 },
      { word: "less", start: 5.2, duration: 0.1 },
      { word: "whom", start: 5.3, duration: 0.1 },
      { word: "he", start: 5.4, duration: 0.1 },
      { word: "knows", start: 5.5, duration: 0.1 },
      { word: "intimately,", start: 5.6, duration: 0.1 },
      { word: "and", start: 5.7, duration: 0.1 },
      { word: "out", start: 5.8, duration: 0.1 },
      { word: "of", start: 5.9, duration: 0.1 },
      { word: "the", start: 6.0, duration: 0.1 },
      { word: "dozen,", start: 6.1, duration: 0.1 },
      { word: "one", start: 6.2, duration: 0.1 },
      { word: "or", start: 6.3, duration: 0.1 },
      { word: "two", start: 6.4, duration: 0.1 },
      { word: "friends", start: 6.5, duration: 0.1 },
      { word: "at", start: 6.6, duration: 0.1 },
      { word: "most,", start: 6.7, duration: 0.1 },
      { word: "it", start: 6.8, duration: 0.1 },
      { word: "will", start: 6.9, duration: 0.1 },
      { word: "easily", start: 7.0, duration: 0.1 },
      { word: "be", start: 7.1, duration: 0.1 },
      { word: "seen,", start: 7.2, duration: 0.1 },
      { word: "when", start: 7.3, duration: 0.1 },
      { word: "we", start: 7.4, duration: 0.1 },
      { word: "remember", start: 7.5, duration: 0.1 },
      { word: "the", start: 7.6, duration: 0.1 },
      { word: "number", start: 7.7, duration: 0.1 },
      { word: "of", start: 7.8, duration: 0.1 },
      { word: "millions", start: 7.9, duration: 0.1 },
      { word: "who", start: 8.0, duration: 0.1 },
      { word: "inhabit", start: 8.1, duration: 0.1 },
      { word: "this", start: 8.2, duration: 0.1 },
      { word: "world,", start: 8.3, duration: 0.1 },
      { word: "that", start: 8.4, duration: 0.1 },
      { word: "probably,", start: 8.5, duration: 0.1 },
      { word: "since", start: 8.6, duration: 0.1 },
      { word: "the", start: 8.7, duration: 0.1 },
      { word: "earth", start: 8.8, duration: 0.1 },
      { word: "was", start: 8.9, duration: 0.1 },
      { word: "created,", start: 9.0, duration: 0.1 },
      { word: "the", start: 9.1, duration: 0.1 },
      { word: "right", start: 9.2, duration: 0.1 },
      { word: "man", start: 9.3, duration: 0.1 },
      { word: "has", start: 9.4, duration: 0.1 },
      { word: "never", start: 9.5, duration: 0.1 },
      { word: "yet", start: 9.6, duration: 0.1 },
      { word: "met", start: 9.7, duration: 0.1 },
      { word: "the", start: 9.8, duration: 0.1 },
      { word: "right", start: 9.9, duration: 0.1 },
      { word: "woman.", start: 10.0, duration: 0.1 },
    ],
    audioUrl: "https://audio.tatoeba.org/sentences/eng/7697649.mp3",
    wayaku:
      "間違いなく、この世界には、あらゆる男性にとって結婚するのに相応しい女性が存在し、またその逆もあります。しかし、人間が知り合う機会があるのはほんの数百人程度で、その数百人のうち親しく知っているのは十数人かそれ以下、そして十数人のうち友人と呼べるのは多くても1人か2人だけであることを考えると、何百万人もの人々がこの世界に住んでいることを思い出せば、おそらく、地球が創造されて以来、相応しい男性が相応しい女性に出会ったことはまだ一度もないのでしょう。",
  },
];

// オーディオファイルを事前にロードする
const preload = () => {
  const audio = new Audio();
  for (const data of karaokeData) {
    audio.src = data.audioUrl;
    audio.load();
  }
};
preload();
