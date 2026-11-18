# 画像監査・商品対応表

2026-11-19。ZIP内80ファイルを展開済みフォルダーと照合し、4枚のコンタクトシートで全件目視確認。以前の仮分類は採用せず、写っている形と料理構成を優先した。

## 集計

- 元画像80枚／SHA-256で64種類（完全重複16枚）。
- 主画像33枚＋ギャラリー6枚＝公開用39枚。
- 未採用41枚＝完全重複16枚＋同一料理の別構成・広告等16枚＋料理以外・配給食資料等9枚。
- 既存6品を維持、新規27品、合計33品。
- おすすめ7品、お持ち帰り対応12品は重複するフィルター。
- WebP、長辺最大1100px、品質84。公開用39枚の合計2,961,998 bytes（約2.96 MB）。

|分類|商品数|
|---|---:|
|ハンバーグ・グリル（サンド・プレートを含む）|10|
|デザート|6|
|スープ・サイド|5|
|パスタ・グラタン|4|
|ごはん・丼|5|
|和食・寿司|2|
|お持ち帰り専用|1|

## 商品と主画像

商品情報の正本は `js/menu-data.js`。税込価格も一覧・詳細・トップ特集がこのデータを参照する。

|商品ID|商品名|税込価格|元画像|公開画像|
|---|---|---:|---|---|
|layered-sandwich|多層合成チキンサンド|¥1,480|IMG_6192.jpg|[layered-sandwich](../images/menu/grill/layered-sandwich.webp)|
|seasonal-hamburg|季節の贅沢合成ハンバーグ|¥2,400|0a058282-995e-4121-a0b2-efdc548d6044.png|[seasonal-hamburg](../images/menu/grill/seasonal-hamburg.webp)|
|protein-pie|タンパク質キューブのパイ包み|¥1,680|b566aca2-9bd1-4da1-84f5-0c4b53c3c857.png|[protein-pie](../images/menu/grill/protein-pie.webp)|
|standard-plate|標準栄養プレート|¥980|ChatGPT Image 2025年5月23日 22_26_21.png|[standard-plate](../images/menu/grill/standard-plate.webp)|
|cube-parfait|カラーキューブ・パフェ|¥1,080|1240115b-52be-4249-93cd-060e0cdb8942.png|[cube-parfait](../images/menu/dessert/cube-parfait.webp)|
|custard-tower|栄養カスタードの円筒デザート|¥780|e729b37b-a1d8-414f-8c4b-0d872635ef4b.png|[custard-tower](../images/menu/dessert/custard-tower.webp)|
|vegetable-cocotte|彩りキューブのココット|¥680|156070ac-362b-4d06-b7ed-06ae09f9e891.png|[vegetable-cocotte](../images/menu/side/vegetable-cocotte.webp)|
|afternoon-tea|キューブスイーツのアフタヌーンティー|¥1,980|187d6c22-519d-4e46-8098-bd3f47e5c554.png|[afternoon-tea](../images/menu/dessert/afternoon-tea.webp)|
|cube-salad|彩り合成キューブのサラダ|¥580|3c9e16e2-2fbb-4a5f-b8a7-48fa480bbac7.png|[cube-salad](../images/menu/side/cube-salad.webp)|
|tomato-short-pasta|合成ショートパスタのトマトソース|¥1,180|3f3d1ccd-4c52-45cb-a574-4ffd8412c4c4.png|[tomato-short-pasta](../images/menu/pasta/tomato-short-pasta.webp)|
|synthetic-montblanc|合成マロンのモンブラン|¥880|61e4beac-cb91-448c-b1d5-e8e96822a8bf.png|[synthetic-montblanc](../images/menu/dessert/synthetic-montblanc.webp)|
|cube-tiramisu|合成クリームのキューブティラミス|¥780|709688d6-bb0c-49d4-ba13-8982ea16fba5.png|[cube-tiramisu](../images/menu/dessert/cube-tiramisu.webp)|
|stargazy-pie|復元海洋タンパクのスターゲイジーパイ|¥1,880|81373d4f-8b3b-446e-bc22-38b843b34cb1.png|[stargazy-pie](../images/menu/grill/stargazy-pie.webp)|
|iron-cube-rice|彩りキューブの鉄鍋ごはん|¥1,080|8aec2055-0212-4e95-9d70-31e95b6b2e55.png|[iron-cube-rice](../images/menu/rice/iron-cube-rice.webp)|
|salmon-style-set|合成サーモンの和風御膳|¥1,380|9725fdef-0a9f-4496-8d42-a2972fb83aff.png|[salmon-style-set](../images/menu/japanese/salmon-style-set.webp)|
|gear-cream-pasta|歯車パスタとキューブのクリームソース|¥1,180|b0724171-48e1-46fa-b830-4332d60b0f3c.png|[gear-cream-pasta](../images/menu/pasta/gear-cream-pasta.webp)|
|cheese-style-bites|合成チーズのひとくちスティック|¥480|b596bd65-6db2-49c6-a512-50375373be89.png|[cheese-style-bites](../images/menu/side/cheese-style-bites.webp)|
|rainbow-layer-cake|彩りクリームのレイヤーケーキ|¥780|bec0bdd5-17e6-49f7-8f75-69bd57507250.png|[rainbow-layer-cake](../images/menu/dessert/rainbow-layer-cake.webp)|
|cube-sandwich|彩りキューブの合成サンド|¥980|cb6af95d-0b7f-465a-b0b8-f1dfee5dfc83.png|[cube-sandwich](../images/menu/grill/cube-sandwich.webp)|
|synthetic-curry|合成ビーフのキューブカレー|¥1,080|ce55b40b-9561-4f38-bc81-393d445f4857.png|[synthetic-curry](../images/menu/rice/synthetic-curry.webp)|
|color-cream-pasta|彩り栄養キューブのクリームパスタ|¥1,280|ChatGPT Image 2025年5月26日 22_43_08.png|[color-cream-pasta](../images/menu/pasta/color-cream-pasta.webp)|
|corn-cube-soup|黄金キューブのコーンスープ|¥380|ChatGPT Image 2025年5月26日 22_43_12.png|[corn-cube-soup](../images/menu/side/corn-cube-soup.webp)|
|cream-cube-stew|合成キューブのクリームシチュー|¥1,180|ChatGPT Image 2025年5月26日 22_43_15.png|[cream-cube-stew](../images/menu/grill/cream-cube-stew.webp)|
|teriyaki-chicken-bowl|合成チキンの照り焼き丼|¥1,080|ChatGPT Image 2025年5月26日 22_43_17.png|[teriyaki-chicken-bowl](../images/menu/rice/teriyaki-chicken-bowl.webp)|
|savory-cube-bowl|合成タンパクの旨だれ丼|¥980|ChatGPT Image 2025年5月26日 22_43_26.png|[savory-cube-bowl](../images/menu/rice/savory-cube-bowl.webp)|
|synthetic-katsudon|合成ロースカツ丼|¥1,180|ChatGPT Image 2025年5月26日 22_43_27.png|[synthetic-katsudon](../images/menu/rice/synthetic-katsudon.webp)|
|brown-sauce-grill|合成グリルのブラウンソース|¥1,480|ChatGPT Image 2025年5月26日 22_43_31.png|[brown-sauce-grill](../images/menu/grill/brown-sauce-grill.webp)|
|synthetic-beef-stew|じっくり煮込んだ合成ビーフシチュー|¥1,580|ChatGPT Image 2025年5月26日 22_43_39.png|[synthetic-beef-stew](../images/menu/grill/synthetic-beef-stew.webp)|
|synthetic-sushi|合成にぎりの彩り盛り合わせ|¥1,680|ChatGPT Image 2025年5月26日 22_43_42.png|[synthetic-sushi](../images/menu/japanese/synthetic-sushi.webp)|
|synthetic-steak|合成ビーフの厚切りステーキ|¥1,980|ChatGPT Image 2025年5月26日 22_43_53.png|[synthetic-steak](../images/menu/grill/synthetic-steak.webp)|
|cube-gratin|ごろごろ合成キューブのグラタン|¥1,380|ChatGPT Image 2025年5月26日 22_43_56.png|[cube-gratin](../images/menu/pasta/cube-gratin.webp)|
|broth-cocotte|彩りキューブのスープココット|¥780|ChatGPT Image 2025年5月26日 22_44_04.png|[broth-cocotte](../images/menu/side/broth-cocotte.webp)|
|cube-bento|合成チキンのキューブ弁当|¥980|ea75d75d-1339-4011-b783-99777dbc9d4f.png|[cube-bento](../images/menu/takeout/cube-bento.webp)|

## 追加写真

|商品ID|元画像|公開画像|
|---|---|---|
|seasonal-hamburg|03f8ac25-00b2-46d1-b86e-ece51acc3716.png|[seasonal-hamburg](../images/menu/grill/seasonal-hamburg-1.webp)|
|cube-parfait|b7a6dbab-553f-4866-a87c-53370d8b9022.png|[cube-parfait](../images/menu/dessert/cube-parfait-1.webp)|
|cube-parfait|ChatGPT Image 2025年5月23日 22_54_28.png|[cube-parfait](../images/menu/dessert/cube-parfait-2.webp)|
|cube-parfait|ChatGPT Image 2025年5月23日 23_05_43.png|[cube-parfait](../images/menu/dessert/cube-parfait-3.webp)|
|color-cream-pasta|ChatGPT Image 2025年5月26日 22_43_10.png|[color-cream-pasta](../images/menu/pasta/color-cream-pasta-1.webp)|
|brown-sauce-grill|ChatGPT Image 2025年5月26日 22_43_32.png|[brown-sauce-grill](../images/menu/grill/brown-sauce-grill-1.webp)|

## 全80枚の記録

[全件CSV](image-product-map.csv) / [ハッシュ・寸法・採否JSON](image-audit.json)。visualGroupは同じ料理のグループで、ピクセル一致とは区別する。

[コンタクトシート1](contact-1.jpg) / [コンタクトシート2](contact-2.jpg) / [コンタクトシート3](contact-3.jpg) / [コンタクトシート4](contact-4.jpg)

## 採用時の判断

- 価格¥3,680・ドリンクバー付きの暗い広告は不採用。季節のハンバーグは既存税込¥2,400を維持し、写真内表記も一致する2枚を採用。
- ハンバーグの文字なし素材は確認できなかったため、価格が一致する広告写真を使用。その他の商品カードは文字なし写真を優先。
- スターゲイジーパイとアフタヌーンティーを分離。魚の頭がある写真は前者、三段スタンドは後者として採用。
- 揚げ衣のカツ丼と照り焼き風・旨だれ風の丼は、見た目の構造が明確に違うため別商品とした。
- 寿司、カレー、モンブラン、ステーキ等の構図・構造違いは商品数を増やすために使用しない。
- ビュッフェ全景、スタッフ、研究食や配給トレーは単品メニューへ混在させない。既存の会社紹介写真は維持。
- 商品名・味の説明は架空の設定。実際の栄養成分や配合量は設定しない。

## 再最適化

元画像はリポジトリに含めない。`python scripts/optimize-images.py <展開フォルダー>` でハッシュを照合し、採用39枚だけ再生成できる。Pillowが必要。
