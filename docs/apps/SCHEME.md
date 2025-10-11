# Data Scheme

このプロジェクトで扱われる主要なデータ構造を定義します。

## 1. フロントエンド (Canvas)

### `LetterObject`

Canvas上の個々のオブジェクト（テキスト、画像、エフェクトなど）を表すデータです。`/api/generate-image` に送る構造とほぼ同一ですが、現在の主要フローではクライアント側で PNG 化し、`sparkle-effect` など一部オブジェクトの JSON を別途保存します。

```typescript
type LetterObject =
  | {
      type: "text";
      width?: number;
      height?: number;
      angle?: number;
      centerX?: number;
      centerY?: number;
      text?: string;
      fontSize?: number;
      fill?: string;
      fontFamily?: string;
    }
  | {
      type: "image";
      width?: number;
      height?: number;
      angle?: number;
      centerX?: number;
      centerY?: number;
      src?: string; // Base64 encoded image data for images
    }
  | {
      type: "sparkle-effect";
      effectColor?: string;
      initialWidth?: number;
      initialHeight?: number;
      // 実際の粒子データは `objects` 配列として `toJSON` で保存されます
    };
```

### `LetterCanvas`

Canvas全体の状態を表すインターフェースです。

```typescript
interface LetterCanvas {
  width: number;
  height: number;
  background: string; // 背景画像のパス (e.g., '/template-papers/beach.png')
  objects: LetterObject[];
  // sparkles 等の動的エフェクトは保存時に別 JSON として抽出され、`letterImages.imageEffectsJson` に保存されます
}
```

## 2. 認証 (NextAuth.js)

### `Session.user`

NextAuth.jsのセッションで管理されるユーザー情報の型です。

```typescript
interface User {
  name?: string | null;
  image?: string | null; // LINE Profile Image URL
}
```

## 3. バックエンド (Supabase)

### Storage

- **バケット**: 現行実装では `line-letter` バケットを使用。環境変数 `NEXT_PUBLIC_SUPABASE_BUCKET_NAME` または `SUPABASE_BUCKET_NAME` で上書き可能です。
- **オブジェクト**:
    - 送信処理時にクライアントから直接アップロードされます。ページごとに `letterId/` プレフィックス付きで保存され、ファイル名は `page-01-*.png` の形式です。

### データベース (Supabase)

「LINEで送信」時に、手紙の情報が Supabase のデータベースに保存されます。

**注意:** 編集途中の作業内容を保存する機能は実装されていません。ユーザーがブラウザをリロードしたり閉じたりすると、編集中の内容は失われます。

#### `letters` テーブル

手紙全体を識別するためのテーブルです。

| 列名 | 型 | 説明 |
| :--- | :--- | :--- |
| `id` | `uuid` | **Primary Key**。手紙の一意なID。`crypto.randomUUID()` で生成されます。 |
| `author` | `text` | 作成者名。LINEのプロフィール名が格納されます (未取得時は "ゲスト" を保存)。 |
| `created_at` | `timestampz` | 作成日時 (自動) |

#### `letterImages` テーブル

手紙の各ページの情報と、関連する画像やエフェクトを管理するテーブルです。

| 列名 | 型 | 説明 |
| :--- | :--- | :--- |
| `id` | `uuid` | **Primary Key**。|
| `letterId` | `uuid` | **Foreign Key**。`letters.id` を参照します。 |
| `imageURL` | `text` | Supabase Storageに保存された静止画像の公開URL。 |
| `pageNumber` | `integer` | ページ番号。 |
| `imageEffectsJson` | `jsonb` | Canvas上の動的なエフェクト（キラキラなど）の情報をJSON形式で保存します。 |
| `created_at` | `timestampz` | 作成日時 (自動) |
