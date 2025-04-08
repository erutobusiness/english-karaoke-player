import { useEffect, useRef, useState } from 'react';
import type { KaraokeText } from './data';
import './Wayaku.css';

interface WayakuProps {
  karaokeData: KaraokeText[];
  containerRef: React.RefObject<HTMLDivElement | null>;
}

interface TranslationPosition {
  top: number;
  left: number;
  width: number;
  index: number; // 文のインデックスを追加
}

/**
 * 和訳表示用コンポーネント
 * 英文の下に和訳を表示する
 */
const Wayaku: React.FC<WayakuProps> = ({ karaokeData, containerRef }) => {
  const [translationPositions, setTranslationPositions] = useState<TranslationPosition[]>([]);
  const measureRef = useRef<HTMLSpanElement>(null); // 和訳測定用

  useEffect(() => {
    const calculateTranslationPositions = () => {
      if (!containerRef.current || !measureRef.current) return;

      // data-sentence-index を持つすべての単語要素を取得
      const wordElements = Array.from(containerRef.current.querySelectorAll('[data-sentence-index]')) as HTMLElement[];

      // 文ごとに最初の単語要素の位置情報を抽出
      const sentenceRects = wordElements.reduce<Array<{ rect: DOMRect; index: number }>>((acc, el) => {
        const indexStr = el.getAttribute('data-sentence-index');
        if (indexStr === null) return acc;
        const index = Number.parseInt(indexStr, 10);
        if (Number.isNaN(index)) return acc;

        // 同じインデックスの要素がまだ追加されていなければ追加
        if (!acc.some(item => item.index === index)) {
          acc.push({
            rect: el.getBoundingClientRect(), // 最初の単語の位置
            index: index,
          });
        }
        return acc;
      }, []);

      // インデックス順にソート
      sentenceRects.sort((a, b) => a.index - b.index);

      const containerRect = containerRef.current.getBoundingClientRect();

      // 各文に対応する和訳の位置を計算
      const positions = sentenceRects.map(({ rect, index }) => { // map の引数を修正
        if (measureRef.current) {
          const wayakuText = karaokeData[index]?.wayaku || ''; // ?. を追加して安全にアクセス
          measureRef.current.textContent = wayakuText;
          const wayakuWidth = measureRef.current.offsetWidth;

          // 位置計算 (getBoundingClientRect を基準に戻す)
          const top = rect.bottom - containerRect.top + 2; // 下端基準、オフセット+2
          const left = rect.left - containerRect.left; // 元の計算方法に戻す
          const width = wayakuWidth; // 和訳テキストの幅を使用

          return { top, left, width, index }; // index を含める
        }

        // fallback (measureRefがない場合)
        return {
          top: rect.bottom - containerRect.top + 2, // 下端基準、オフセット+2
          left: rect.left - containerRect.left, // 元の計算方法に戻す
          width: rect.width, // 最初の単語の幅
          index: index // index を含める
        };
      });

      setTranslationPositions(positions);
    };

    // DOMのレンダリングとスタイルの適用を待つために少し遅延させる
    const timerId = setTimeout(calculateTranslationPositions, 100); // 遅延を短縮

    window.addEventListener('resize', calculateTranslationPositions);

    return () => {
      clearTimeout(timerId);
      window.removeEventListener('resize', calculateTranslationPositions);
    };
  }, [karaokeData, containerRef]); // 依存配列に containerRef を含める

  return (
    <>
      {/* 測定用の隠し要素 - 和訳用 */}
      <span
        ref={measureRef}
        className="wayaku-measure"
        style={{
          position: 'absolute',
          visibility: 'hidden',
          height: 'auto',
          width: 'auto',
          whiteSpace: 'nowrap', // 正確な幅測定のため
        }}
      />

      {/* 和訳表示 */}
      {karaokeData.map((item, itemIndex) => {
        // translationPositions から対応するインデックスの位置情報を検索
        const pos = translationPositions.find(p => p.index === itemIndex);

        // 対応する位置情報がない場合は何もレンダリングしない
        if (!pos) {
           // console.warn(`Position data for index ${itemIndex} not found.`); // デバッグ用（必要ならコメント解除）
           return null;
        }


        return (
          <div
            key={`japanese-${item.audioUrl}-${itemIndex}`} // よりユニークなキー
            className="japanese-text-block"
            style={{
              position: 'absolute',
              top: `${pos.top}px`, // 単位を追加
              left: `${pos.left}px`, // 単位を追加
              width: `${pos.width}px`, // 単位を追加
              boxSizing: 'border-box',
              opacity: translationPositions.length > 0 ? 1 : 0,
              transition: 'opacity 0.3s ease',
              pointerEvents: 'none', // 和訳がクリックイベントを妨げないように
              fontSize: '0.5em', // フォントサイズをさらに小さく
              color: '#333', // 色を濃くする (黒に近いグレー)
              lineHeight: '4', // 行間調整
            }}
          >
            {item.wayaku}
          </div>
        );
      })}
    </>
  );
};

export default Wayaku;