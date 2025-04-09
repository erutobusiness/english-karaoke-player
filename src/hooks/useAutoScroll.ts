import { useEffect, type RefObject } from "react";

/**
 * 指定した要素が表示領域内に収まるようスクロールするカスタムフック
 * @param elementRef - スクロールの対象となる要素の参照
 * @param containerRef - スクロールコンテナの参照
 * @param dependencies - useEffectの依存配列に追加する値
 * @param offset - スクロール時の余白 (デフォルト: 20px)
 */
export const useAutoScroll = (
  elementRef: RefObject<HTMLElement | null>,
  containerRef: RefObject<HTMLElement | null>,
  // biome-ignore lint/suspicious/noExplicitAny: 依存配列はany型を使用
  dependencies: any[] = [],
  offset = 20
) => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: 依存配列によりスクロール位置を更新するため、dependenciesを使用
  useEffect(() => {
    if (elementRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = elementRef.current;

      // 要素の位置を取得
      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // 要素が表示範囲外かチェック
      const isElementAboveView = elementRect.top < containerRect.top;
      const isElementBelowView = elementRect.bottom > containerRect.bottom;

      if (isElementAboveView) {
        // 要素が表示範囲より上にある場合、要素の上端が表示されるようにスクロール
        container.scrollTo({
          top: container.scrollTop + (elementRect.top - containerRect.top) - offset,
          behavior: "smooth",
        });
      } else if (isElementBelowView) {
        // 要素が表示範囲より下にある場合、要素の下端が表示されるようにスクロール
        container.scrollTo({
          top: container.scrollTop + (elementRect.bottom - containerRect.bottom) + offset,
          behavior: "smooth",
        });
      }
    }
  }, [dependencies, offset]);
};
