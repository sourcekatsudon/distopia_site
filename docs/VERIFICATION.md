# 検証記録 — 2026-11-19

- `node --check js/script.js` / `node --check js/menu-data.js` / solar-system.js のES module構文確認: 成功。
- `node tests/smoke.cjs`: 成功。既存14リダイレクト、ページ構造、全33商品のID・実在画像、全80画像の対応、カテゴリ検索API、太陽系の公転・自転・カリスト親子関係を検証。
- `tests/browser.cjs` を接続済みPlaywright Chromiumで実行: **170チェック成功、JavaScript例外0、対象サイトのHTTPエラー0**。
- ブラウザ確認: 33商品すべての詳細（名前・価格・正しい主画像・戻るリンク）、検索0件とクリア、8分類と全件、12→24→33件表示、URL条件と戻る操作、未知ID・未知カテゴリ、ギャラリー切替。
- 幅320/390/768/1440pxのホームで横はみ出しなし、スクロール後の画像欠落なし。PCとスマホのスクリーンショットを目視確認。
- スマホでナビ開閉とEscape時のフォーカス復帰を確認。
- company.htmlとsolar-system.jsのGit差分なし。実ブラウザのキャンバス画像が再生中は変化し、一時停止後は静止、再開可能。カリストのヴァルハラ店情報を表示。
- 太陽系の描画は停止直後のスクロール・GPU描画が落ち着くまで待って比較（1秒）。マップの実装は変更しない。
- 画像最適化: 39 WebP、合計2,961,998 bytes。元の154MB ZIPはGitに含めない。

## Antigravity委任とCodexの検品

- Sonnet 5.5 High: 一覧・詳細・ギャラリーとCSSの変更案。提案のみを返却し、Codexが差分確認・統合。
- Gemini 3.8 Flash Medium: 33品の文章上の矛盾・価格・数値栄養表記を監査。明確な問題なし。実画像照合はCodexが担当。
- Opus 5.5 High: JSと追加CSS・テストの独立レビュー。検索直後のカテゴリ変更で入力が消える問題を指摘。Codexがブラウザで再現し、回帰テストを失敗→成功にして修正。
- 同じ検索値や履歴イベントで展開件数が戻る挙動、無効商品の空関連欄、Escape後のフォーカスを確認して修正。カテゴリ許可値・boolean型・画像manifest一致の検証も追加。
- 条件付きのマップボタン干渉は非該当: マップはcompany.htmlだけにあり、data-planetを使う。menu-gridがないページではカタログ初期化しない。
- `.wrap`は幅とmarginで左右余白を取るため、無効商品欄のpadding指定による余白欠落は非該当。
- 長い検索語はoverflow-wrapで折り返す。メニューデータは同じdefer順でscript.jsより先に読み込むため、遅延ロード懸念は非該当。

## 再実行と限界

静的チェックは既存GitHub Actionsでも実行。ローカルは `python -m http.server 8765` 後、Playwrightを利用できる環境なら `node tests/browser.cjs`。このファイルは `run(page)` をexportしているため、既存のPlaywrightセッションにも渡せる。BASE_URLで対象を変更可能。

今回の実表示検証はChromium。Safari/Firefoxおよび実機タッチ操作の確認は未実施。ネイティブIME実機入力は未確認だが、入力とカテゴリclickを同一ターンに発火させる回帰テストを実施。外部CDNのThree.js・Google Fontsには既存のまま依存する。

## 公開確認

既存featureブランチへのpushでVercel PreviewがREADYになることを確認。本番mainへのマージ・本番設定変更なし。プレビューは既存Vercel Authentication保護の対象で、閲覧には認証が必要。最終URL・SHAはPR #1に記録する。
