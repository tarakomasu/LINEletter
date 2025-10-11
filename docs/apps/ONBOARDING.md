# Onboarding Document

新しい開発者がこのプロジェクトに参加するためのガイドです。

## 1. 必要なツール

- **Node.js**: `v20.x` 以上を推奨します。
- **npm / yarn / pnpm**: パッケージ管理ツール。
- **Git**: バージョン管理システム。
- **LINE Developers Account**: LINEログインとLIFF機能のテストに必要です。
- **Supabase Account**: 画像ストレージのテストに必要です。

## 2. 環境構築手順

1. **リポジトリのクローン**

    ```bash
    git clone <repository-url>
    cd line-letter
    ```

2. **パッケージのインストール**

    ```bash
    npm install
    ```

3. **環境変数の設定**

    プロジェクトのルートディレクトリに `.env.local` という名前のファイルを作成し、以下の内容を記述・設定してください。

    ```env
    # LINE Login Credentials
    # LINE Developers (https://developers.line.biz/) のプロバイダー設定から取得
    LINE_CLIENT_ID=
    LINE_CLIENT_SECRET=

    # NextAuth.js Secret
    # 以下のコマンドなどで生成したランダムな文字列を設定
    # openssl rand -base64 32
    NEXTAUTH_SECRET=

    # Supabase Credentials
    # SupabaseプロジェクトのSettings > API から取得
    NEXT_PUBLIC_SUPABASE_URL=
    NEXT_PUBLIC_SUPABASE_ANON_KEY= # ANON KEY をここに設定します
    SUPABASE_SERVICE_KEY=

    # Supabase Storage Bucket Name
    # 画像を保存するバケット名 (例: letters)
    SUPABASE_BUCKET_NAME=

    # LIFF ID
    # LINE Developers で発行した LIFF アプリの ID を設定します。
    NEXT_PUBLIC_LIFF_ID=
    ```

4. **開発サーバーの起動**

    ```bash
    npm run dev
    ```

    `http://localhost:3000` にアクセスしてアプリケーションが表示されればセットアップ完了です。

## 3. 開発にあたって

- **コーディングスタイル**: プロジェクトには `ESLint` が導入されています。コミット前に `npm run lint` を実行し、エラーがないことを確認してください。
- **ブランチ戦略**: 特に厳密なルールはありませんが、`main`ブランチを保護し、機能開発や修正は個別のブランチ（例: `feature/my-new-feature`）で行い、プルリクエストを通じてマージする方法を推奨します。
- **LIFFのセットアップ**: LINEログインやLIFF機能をローカルでテストする場合、LIFFアプリのエンドポイントURLに `http://localhost:3000` を登録する必要があります。
