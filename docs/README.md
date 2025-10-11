# LINE Letter

## 1. 概要

Webアプリ上で手紙を作成し、LINEを通じてシェアできるサービスです。ユーザーはテンプレートを選び、テキストや画像を追加してオリジナルのカードを作成し、LINEのトーク画面で共有できます。

## 2. 主な機能

- LINEアカウントによる認証
- テンプレート選択機能
- Canvasエディタ (PC向け) によるテキスト・画像・エフェクトの編集
- Supabase Storage にページごとの画像を保存し、LINEで閲覧リンクを共有

## 3. 技術スタック

- **フロントエンド:** Next.js (App Router), React, TypeScript
- **スタイリング:** Tailwind CSS
- **認証:** NextAuth.js (LINE Provider)
- **画像・データストレージ:** Supabase Storage
- **Canvas操作:** Fabric.js
- **LINE連携:** LIFF (LINE Front-end Framework) ※環境変数 `NEXT_PUBLIC_LIFF_ID` が必要

## 4. セットアップと実行

### 4.1. 前提条件

- Node.js (v20.x 以上を推奨)
- npm / yarn / pnpm

### 4.2. インストール

```bash
npm install
```

### 4.3. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、必要な環境変数を設定します。詳細は `docs/ONBOARDING.md` を参照してください。

### 4.4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。
ログイン後のメイン体験はデスクトップ向けエディタ (`/pages/line-letter-desktop/editor`) に用意されています。モバイル版はプレースホルダ段階です。

### 4.5. ビルドと本番起動

```bash
# ビルド
npm run build

# 本番サーバー起動
npm run start
```
