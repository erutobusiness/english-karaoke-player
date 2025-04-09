import { useEffect, useState } from "react";
import type { KaraokeText } from "./data";
import "./Wayaku.css";

interface WayakuProps {
  karaokeData: KaraokeText[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  textsWrapperRef: React.RefObject<HTMLDivElement | null>;
}

interface TranslationPosition {
  top: number;
  left: number;
  index: number;
}

/**
 * 和訳表示用コンポーネント
 * 英文の下に和訳を表示する
 */
const Wayaku: React.FC<WayakuProps> = ({ karaokeData, containerRef, textsWrapperRef }) => {
  const [translationPositions, setTranslationPositions] = useState<TranslationPosition[]>([]);

  useEffect(() => {
    const calculateTranslationPositions = () => {
      if (!containerRef.current || !textsWrapperRef.current) return;

      // data-sentence-index を持つすべての単語要素を取得
      const wordElements = Array.from(
        containerRef.current.querySelectorAll("[data-sentence-index]")
      ) as HTMLElement[];

      // 文ごとに単語要素をグループ化
      const sentenceGroups = wordElements.reduce<Record<string, HTMLElement[]>>((acc, el) => {
        const indexStr = el.getAttribute("data-sentence-index");
        if (indexStr === null) return acc;
        const index = Number.parseInt(indexStr, 10);
        if (Number.isNaN(index)) return acc;

        if (!acc[index]) {
          acc[index] = [];
        }
        acc[index].push(el);
        return acc;
      }, {});

      // より直接的な親要素であるテキストラッパーの位置情報を取得
      const wrapperRect = textsWrapperRef.current.getBoundingClientRect();

      // 各文グループから位置情報を計算
      const positions = Object.entries(sentenceGroups).map(([indexStr, elements]) => {
        const index = Number.parseInt(indexStr, 10);

        // 文の最初の単語の位置
        const firstElement = elements[0];
        const firstRect = firstElement.getBoundingClientRect();

        // 位置計算 - テキストラッパーを基準にする
        const top = firstRect.bottom - wrapperRect.top; // 下端基準
        const left = firstRect.left - wrapperRect.left; // 左端基準

        return { top, left, index };
      });

      // インデックス順にソート
      positions.sort((a, b) => a.index - b.index);
      setTranslationPositions(positions);
    };

    // DOMのレンダリングとスタイルの適用を待つために少し遅延させる
    const timerId = setTimeout(calculateTranslationPositions, 100);

    window.addEventListener("resize", calculateTranslationPositions);

    return () => {
      clearTimeout(timerId);
      window.removeEventListener("resize", calculateTranslationPositions);
    };
  }, [containerRef, textsWrapperRef]);

  return (
    <div className="wayaku-wrap">
      {karaokeData.map((item, itemIndex) => {
        // translationPositions から対応するインデックスの位置情報を検索
        const pos = translationPositions.find((p) => p.index === itemIndex);

        // 対応する位置情報がない場合は何もレンダリングしない
        if (!pos) return null;

        return (
          <div
            key={`japanese-${item.audioUrl}-${itemIndex}`}
            className="japanese-text-block"
            style={{
              top: `${pos.top}px`,
              left: 0,
              opacity: 1,
            }}
          >
            <span
              className="spacing-span"
              style={{ width: `${pos.left}px`, display: "inline-block" }}
            />
            <span className="wayaku-text">{item.wayaku}</span>
          </div>
        );
      })}
    </div>
  );
};

export default Wayaku;
