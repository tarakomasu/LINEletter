/**
 * LINE Flex MessageのJSONオブジェクトを生成する
 * @param envelopeUrl - 封筒画像の公開URL
 * @param viewUrl - 手紙の閲覧ページのURL
 * @returns LINE Flex MessageのJSONオブジェクト
 */
export const createFlexMessage = (envelopeUrl: string, viewUrl: string) => {
  return {
    type: "flex" as const,
    altText: "新しい手紙が届きました！",
    contents: {
      type: "bubble" as const,
      hero: {
        type: "image" as const,
        url: imageUrl,
        size: "full",
        aspectRatio: "20:13",
        aspectMode: "cover" as const,
        action: {
          type: "uri" as const,
          label: "action",
          uri: viewUrl,
        },
      },
      body: {
        type: "box" as const,
        layout: "vertical" as const,
        contents: [
          {
            type: "text" as const,
            text: "手紙が届きました！",
            weight: "bold" as const,
            size: "xl",
          },
          {
            type: "text" as const,
            text: "タップして内容を確認してください。",
            margin: "md",
            wrap: true,
          },
        ],
      },
      footer: {
        type: "box" as const,
        layout: "vertical" as const,
        spacing: "sm" as const,
        contents: [
          {
            type: "button" as const,
            style: "link" as const,
            height: "sm" as const,
            action: {
              type: "uri" as const,
              label: "手紙を開く",
              uri: viewUrl,
            },
          },
          {
            type: "spacer" as const,
            size: "sm",
          },
        ],
        flex: 0,
      },
    },
  };
};
