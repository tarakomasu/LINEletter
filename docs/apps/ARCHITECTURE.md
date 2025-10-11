# Architecture

## 1. 概要

このプロジェクトは Next.js (App Router) をベースに構築されています。認証には NextAuth.js、画像ストレージには Supabase、Canvas 操作用には Fabric.js を利用しています。

## 2. ディレクトリ構造

```
/
├── public/                     # 静的ファイル (テンプレート画像など)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/ # NextAuth.js による認証ルート
│   │   │   ├── generate-image/     # 画像生成(API 経由での保存用)
│   │   │   └── save-letter/        # レガシーな /tmp への保存API (未使用)
│   │   ├── pages/
│   │   │   ├── landing/            # ランディングページ
│   │   │   ├── app-list/           # ログイン後のダッシュボード
│   │   │   ├── line-letter-desktop/editor/      # デスクトップ向けエディタ
│   │   │   ├── line-letter-desktop/letter-editor-old/ # 旧エディタのサンプル
│   │   │   └── line-letter-mobile/              # モバイル画面 (プレースホルダ)
│   │   ├── page.tsx              # ルートページ (認証状態でリダイレクト)
│   │   ├── layout.tsx            # ルートレイアウト
│   │   └── providers.tsx         # NextAuth プロバイダ
│   └── lib/
│       └── effects/sparkle.ts    # Fabric.js カスタムエフェクト
└── docs/                         # ドキュメント
```

## 3. 主要コンポーネントとデータフロー

### 3.1. 認証フロー

1. ユーザーは LINE ログインを実行します。
2. NextAuth.js の LINE Provider を介して認証が行われます。
3. 認証後、`/pages/app-list` にリダイレクトされます。認証状態はクライアントコンポーネント内の `useSession` で検証され、未認証の場合は `/` へ戻されます。

### 3.2. 画像生成フロー

1. **フロントエンド (Editor)**: デスクトップ版エディタ (`/pages/line-letter-desktop/editor`) でユーザーが Fabric.js を用いてページ単位のキャンバスを編集します。
2. **画像アップロード**: 現行実装ではキャンバスから直接 PNG を生成し、Supabase Storage のバケット (`line-letter`) にクライアントサイドでアップロードします。保存時にキャンバス上のキラキラエフェクトは非表示にして画像化し、エフェクトの JSON は別途保存します。
3. **メタデータ保存**: Supabase の `letters` テーブルに手紙 ID と作成者名を、`letterImages` テーブルにページごとの画像 URL とエフェクト JSON を保存します。
4. **共有**: LIFF の `shareTargetPicker` によって、閲覧ページ (`/view?letterId=...`) の URL を LINE 上で共有します。

> 補足: `/api/generate-image` は `sharp` を利用したサーバサイド画像生成 API として残っていますが、現在のメインフローでは直接は使用していません。`/api/save-letter` は `/tmp` への一時保存用だったレガシー API で、フロントエンドからは呼び出されていません。

### 3.3. [要確認] `/api/save-letter` APIについて

- このAPIは、Base64エンコードされた画像をサーバーの `/tmp` ディレクトリに保存する機能を持っています。
- `/api/generate-image` がSupabaseへの永続的な保存を行っているため、このAPIは古いバージョンのものか、あるいは一時的なプレビュー用途である可能性があります。現在の利用状況を確認する必要があります。

## 4. UI構成

- `ServiceCard` (アプリ一覧ページ) は `react-device-detect` を使用し、モバイル判定で遷移先を `line-letter-mobile` と `line-letter-desktop` に切り替えます。モバイル版はまだプレースホルダです。
- `TemplatePickerModal` はページ追加時に表示されるモーダルで、背景テンプレートを選択できます。
- `sparkle.ts` で定義した `sparkle-effect` を用いることで、閲覧画面でアニメーションを再生します。
