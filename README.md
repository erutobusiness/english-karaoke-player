# 英語カラオケプレーヤー

英文を表示し、音声再生とカラオケ風アニメーションを提供するReactアプリケーションです。このアプリケーションは、英語学習者向けに、英文を単語ごとにハイライト表示しながら音声を再生し、リスニングとリーディングスキルの向上をサポートします。

## 機能

このアプリケーションには以下の3つのモードがあります：

### 1. 基本プレーヤー
- シンプルな英文の表示と音声再生
- 単語ごとのカラオケ風アニメーション機能
- クリックで音声再生/停止

### 2. カスタマイズプレーヤー
- 複数のサンプルテキストから選択可能
- 新しい英文の追加機能
- 音声ファイルのアップロード機能
- カラオケスタイルのアニメーション

### 3. 高度なエディター
- 音声ファイルのアップロード
- 英文入力と単語への分割
- タイムライン表示で視覚的にタイミングを設定
- 単語ごとの開始時間と長さを細かく調整
- プロジェクトの保存と読み込み機能
- 詳細なプレビューモード

## インストール方法

```bash
# リポジトリのクローン
git clone https://github.com/erutobusiness/english-karaoke-player.git
cd english-karaoke-player

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 使い方

### 基本プレーヤー
1. 英文をクリックして音声を再生
2. 再生中は単語が順番に赤くハイライト表示される
3. もう一度クリックで停止

### カスタマイズプレーヤー
1. ドロップダウンからテキストを選択
2. 「新しいテキストを作成」ボタンで独自の英文を追加
3. 「音声をアップロード」ボタンで音声ファイルを設定
4. テキストをクリックして再生/停止

### 高度なエディター
1. 音声ファイルをアップロード
2. 英文を入力して「分割して編集」をクリック
3. タイムラインで単語を選択し、「開始時間を設定」と「終了時間を設定」ボタンでタイミングを調整
4. 「プレビュー」ボタンで結果を確認
5. 「プロジェクトを保存」で作業を保存、「プロジェクトを読み込む」で再開

## 技術スタック
- React 19
- Vite
- JavaScript (ES6+)
- HTML5 Audio API
- CSS3 Animations

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
