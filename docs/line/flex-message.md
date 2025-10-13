# LINE Flex Message 仕様

## 1. 概要

LINE Flex Messageは、CSSのFlexible Box（Flexbox）の概念を元に設計されており、レイアウトを自由にカスタマイズできるメッセージ形式です。テキスト、画像、ボタンなどを組み合わせて、単一のメッセージ内でリッチな表現が可能です。

## 2. 基本的なJSON構造

すべてのFlex Messageは、以下の基本構造を持ちます。

```json
{
  "type": "flex",
  "altText": "これはFlex Messageです。",
  "contents": {
    // コンテナオブジェクト (Bubble または Carousel)
  }
}
```

- `altText`: Flex MessageをサポートしていないLINEバージョンや、プッシュ通知、トークリストで表示される代替テキストです。必須項目です。
- `contents`: メッセージの本体となるコンテナオブジェクトを指定します。

## 3. コンテナ (Container)

メッセージ全体の入れ物です。`contents` フィールドに指定します。

- **Bubble:** 単一の吹き出しです。基本的なメッセージはこれで構成されます。
- **Carousel:** 複数のBubbleを横スクロールで表示できるコンテナです。商品リストや複数の選択肢を提示するのに向いています。

## 4. ブロック (Block)

Bubbleコンテナは、最大で4つのブロックを持つことができます。これらはオプションです。

- `hero`: バブルの上部に表示される領域。主に画像（`Image`コンポーネント）を配置します。
- `header`: `hero`ブロックの上、または`hero`がない場合は最上部に表示されるヘッダー領域。
- `body`: メインコンテンツを配置する領域。
- `footer`: バブルの下部に表示されるフッター領域。主にボタン（`Button`コンポーネント）などを配置します。

## 5. 主要なコンポーネント (Component)

各ブロックの中に配置する最小単位の要素です。

- `box`: 他のコンポーネントをグループ化するためのレイアウト用コンポーネント。`layout`プロパティ（`horizontal`, `vertical`, `baseline`）で配置方向を決定します。
- `text`: テキストを表示します。サイズ、色、太さ、折り返しなど、多くのスタイルを指定できます。
- `image`: 画像を表示します。URL、アスペクト比、サイズの指定が可能です。
- `button`: ボタンを配置します。クリックされたときのアクション（URIを開く、ポストバックを送信するなど）を定義できます。
- `separator`: 区切り線を表示します。マージンの調整も可能です。
- `icon`: アイコン画像を表示します。
- `filler`: 空白を挿入するためのコンポーネントです。

## 6. 本アプリでの利用例

「LINE Letter」で作成した手紙を送信する場合、以下のようなBubbleコンテナを持つFlex Messageが考えられます。

- `hero`ブロック: 作成した手紙の画像を表示。
- `body`ブロック: 「手紙が届きました！」といったメッセージを表示。
- `footer`ブロック: 手紙の閲覧ページへのリンクを持つ「手紙を開く」ボタンを配置。

### JSONサンプル

```json
{
  "type": "flex",
  "altText": "新しい手紙が届きました！",
  "contents": {
    "type": "bubble",
    "hero": {
      "type": "image",
      "url": "https://storage.googleapis.com/line-letter-images/letter-xxxxxxxx.png", // 生成された手紙の画像URL
      "size": "full",
      "aspectRatio": "20:13",
      "aspectMode": "cover",
      "action": {
        "type": "uri",
        "label": "action",
        "uri": "https://your-app-domain.com/view?letterId=xxxxxxxx" // 手紙の閲覧ページのURL
      }
    },
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "手紙が届きました！",
          "weight": "bold",
          "size": "xl"
        },
        {
          "type": "text",
          "text": "タップして内容を確認してください。",
          "margin": "md",
          "wrap": true
        }
      ]
    },
    "footer": {
      "type": "box",
      "layout": "vertical",
      "spacing": "sm",
      "contents": [
        {
          "type": "button",
          "style": "link",
          "height": "sm",
          "action": {
            "type": "uri",
            "label": "手紙を開く",
            "uri": "https://your-app-domain.com/view?letterId=xxxxxxxx" // 手紙の閲覧ページのURL
          }
        },
        {
          "type": "spacer",
          "size": "sm"
        }
      ],
      "flex": 0
    }
  }
}
```
