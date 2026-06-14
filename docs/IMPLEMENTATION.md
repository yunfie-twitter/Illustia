# Illustia MVP 実装メモ

## 全体設計

Illustia は Expo + React Native + TypeScript の Pixiv 非公式クライアントです。Pixiv API との接続は `src/lib/pixiv/client.ts` に集約し、画面は TanStack Query hooks 経由で取得します。refresh token は `expo-secure-store` にのみ保存し、ログ出力しません。

## 画面一覧

- 初回設定: refresh token 入力、SecureStore 保存、vendored pixiv.ts SDK の `refreshLogin` で接続確認
- ホーム: おすすめ、ランキング、新着、無限スクロール、Pull to Refresh、Skeleton
- 検索: キーワード、タグ条件、ソート、検索履歴、R-18設定連動
- 作品詳細: 複数ページ、作者導線、タグ、キャプション、ブックマーク追加/削除
- 作者プロフィール: 作者情報、投稿一覧、フォロー/解除
- ブックマーク: 公開/非公開、タグ絞り込み、User ID 指定
- 設定: token削除、R-18、テーマ、画質、キャッシュ削除、アプリ情報

## インストールコマンド

```bash
npm install
npm run start
```

新規作成から再現する場合:

```bash
npx create-expo-app Illustia --template blank-typescript
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npm install @tanstack/react-query zustand expo-secure-store expo-image expo-file-system
npm install react-native-reanimated react-native-gesture-handler react-native-safe-area-context react-native-screens
npm install @react-native-async-storage/async-storage lucide-react-native
npm install buffer process events stream-browserify crypto-browserify querystring-es3 url react-native-url-polyfill
```

## SecureStore 設計

- `illustia.refreshToken`: Pixiv refresh token
- 検索履歴や表示設定は秘匿情報ではないため AsyncStorage に保存
- token 値は UI エラー、console、Query key に含めない

## Pixiv SDK 注意点

`src/lib/pixiv-sdk` に取り込んだ pixiv.ts 実装は `Pixiv.refreshLogin(refreshToken)` を使います。React Native bundling で問題が出る端末や Expo Go 環境では、Pixiv API 呼び出しだけをバックエンド/Edge Function に逃がし、アプリはこの `client.ts` と同じインターフェースを叩く構成に切り替えてください。

## 画像キャッシュと Referer

`expo-image` の `cachePolicy="disk"` を使い、Pixiv画像URLには `Referer: https://www.pixiv.net/` を付与しています。Pixiv 側の仕様変更で画像取得が失敗する場合は、署名付き画像プロキシを用意してください。

## 規約面

このアプリは Pixiv 公式ではありません。利用者自身の token の扱い、過度なリクエスト抑制、作品画像の再配布禁止、Pixiv 利用規約と各作者の権利尊重を明示する必要があります。
