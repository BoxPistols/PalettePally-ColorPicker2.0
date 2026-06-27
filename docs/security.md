# セキュリティノート

監査（2026-06）で確認したセキュリティ事項と対応状況。

## 対応済み

### 共有パレットの列挙穴（修正済み）
- 旧 `firestore.rules` は `allow read: if resource.data.shareId != null` により、shareId を
  知らなくても `where('shareId','!=',null)` で全共有パレットを列挙できた。
- 公開共有を `shares/{shareId}`（nanoid を doc id とするスナップショット）へ移行し、ルールは
  `get` のみ許可（`list` 不可＝列挙不可）。`palettes` は owner 限定読み取りに戻した。
- ⚠️ **デプロイ前にエミュレータでの統合確認を推奨**（本リポジトリは SDK モックでロジックのみ検証）。

### Figma API ルートの入力検証（修正済み）
- `fileKey` を URL 構築前に `encodeURIComponent` でエンコード（パストラバーサル/インジェクション緩和）。
- API ルートは Firebase Admin の Bearer トークン検証（`verifyAuth`）を通過する。

## 既知の未対応（要判断）

### 🟠 Figma Personal Access Token のクライアント露出
- 現状、ユーザーが入力した PAT はブラウザの React state に保持され、`X-Figma-Token`
  ヘッダで `/api/figma/*` に送信される。永続保存はしないが、**XSS が発生した場合に
  PAT が漏洩し Figma アカウントが侵害されうる**。
- **緩和策（実施中）**: UI で最小スコープ + 使用後失効を促す注意書きを表示。トークンは
  セッション内のみ保持し永続化しない。
- **恒久対策（未実施・大規模）**: Figma OAuth 2.0 へ移行し、トークンをサーバー側で
  暗号化保管・セッション鍵で参照、クライアントには一切渡さない構成にする。
  Enterprise 限定機能のため優先度は中。

### 🟠 静的エクスポートと API ルート
- 本番（GitHub Pages, `output: 'export'`）では `pages/api/*` が動作しないため、
  Figma push/import の API 経由機能は本番で 404 になる。Firebase バックエンドや
  別ホスティング（Vercel 等）が必要。

### 🟠 Firestore セキュリティルールのデプロイ
- `firestore.rules` はリポジトリに存在するが、本番 Firestore へのデプロイは別途必要
  （`firebase deploy --only firestore:rules`）。Firebase はオプトイン機能。
