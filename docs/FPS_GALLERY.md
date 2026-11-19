# Chicken House — Visual overhaul / 2026-11-19

最新の実ゲーム画面です。最初のレビュー対象を武器にし、静止・チャージ・発砲・セル交換を比較できます。設計、変更ファイル、検証と制約は [改修レポート](FPS_ART_REPORT.md) を参照。

## ARC-RG7 — 静止 / 両手の構え / 発光グリフ

![新しいレールガンの静止画](fps-captures/art-v2/10-weapon-idle.webp)

## チャージ

![加速器とセルの発光が増すチャージ状態](fps-captures/art-v2/11-weapon-charge.webp)

## 発砲

![青白いマズルフラッシュとビーム](fps-captures/art-v2/12-weapon-fire.webp)

## 自動 / R セル交換

8個の独自グリフが実エネルギー残量に合わせて消灯します。空セルは自動交換、Rで先行交換。左手がセルに追従し、1.8秒後に再装填されます。

![セル交換の連番GIF](fps-captures/art-v2/14-reload-sequence.gif)

GIFは実ゲームを約0.15秒ずつ進め、撮影中のみ一時停止した12枚の連番から構成しています。連続録画ではありません。

![セルを引き抜く途中](fps-captures/art-v2/16-cell-extraction.webp)

## Execution Soldier — 接近

![分割胸部装甲と赤眼を持つ処刑兵](fps-captures/art-v2/15-execution-close.webp)

## 原子炉 / 敵12体の場面

![赤い施設照明と青い主役武器](fps-captures/art-v2/13-reactor-density.webp)

## チャージ命中 / Heavy Enforcer の破壊

![青い放電と金属破片](fps-captures/art-v2/08-heavy-destruction.webp)

## 支配者 / 玉座

![巨大な機械玉座と赤いコード](fps-captures/art-v2/03-ruler.webp)

---

## 改修前の記録

以下は比較用の旧実装です。

# 実プレイ画面

実際のブラウザーから取得した画面。キャンペーンの進行には加速QAを利用している。静止画をゲーム画面として表示する実装ではない。

## 通常サイト

![通常サイト](fps-captures/01-normal-site.webp)

## 危険色ポップアップの増殖

![危険色ポップアップの増殖](fps-captures/02-warning.webp)

## 500msの赤コード上書き

![500msの赤コード上書き](fps-captures/02b-code-overwrite.webp)

## 支配者の処刑メッセージ

![支配者の処刑メッセージ](fps-captures/03-ruler.webp)

## 端末から引くカメラ

![端末から引くカメラ](fps-captures/04-terminal-pullback.webp)

## FPSとレールガン

![FPSとレールガン](fps-captures/05-fps-railgun.webp)

## チャージ射撃

![チャージ射撃](fps-captures/06-railgun-shot.webp)

## 原子炉ホールの戦闘

![原子炉ホールの戦闘](fps-captures/07-reactor-combat.webp)

## 大型敵の破壊

![大型敵の破壊](fps-captures/08-heavy-destruction.webp)

## 脱出成功

![脱出成功](fps-captures/09-escape.webp)
