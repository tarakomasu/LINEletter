# API Documentation

## 1. 認証

### `GET /api/auth/[...nextauth]`

NextAuth.jsによる認証エンドポイントです。LINEログインに使用されます。

- **Provider**: LINE
- **認証後のリダイレクト先**: `/pages/app-list`
- **必要な環境変数**:
    - `LINE_CLIENT_ID`
    - `LINE_CLIENT_SECRET`
    - `NEXTAUTH_SECRET`

## 2. 画像生成

### `POST /api/generate-image`

Canvas のオブジェクト情報を受け取り、サーバー側で `sharp` による画像生成を行い、Supabase にアップロード後、その公開URLを返します。現在の主要フローではクライアント側での直接アップロードを採用していますが、サーバーサイド生成を行いたい場合に利用できます。

- **リクエストボディ** (抜粋)

```json
{
  "width": number,
  "height": number,
  "background": string,
  "objects": [
    {
      "type": "text" | "image",
      "width"?: number,
      "height"?: number,
      "angle"?: number,
      "centerX"?: number,
      "centerY"?: number,
      "text"?: string,
      "fontSize"?: number,
      "fill"?: string,
      "fontFamily"?: string,
      "src"?: string
    }
  ]
}
```

- **レスポンス (Success)**

```json
{
  "url": "https://<your-supabase-project-url>/storage/v1/object/public/letters/letter-1678886400000.png"
}
```

- **レスポンス (Error)**

```json
{
  "error": "Error message",
  "details": "Detailed error message"
}
```

- **必要な環境変数**:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `SUPABASE_SERVICE_KEY`
    - `SUPABASE_BUCKET_NAME`

### `POST /api/save-letter`

Base64 化された PNG データを受け取り、サーバーの `/tmp` ディレクトリに保存するレガシー API です。現行フローでは使用しておらず、将来的な削除候補です。

