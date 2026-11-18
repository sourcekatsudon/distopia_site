// Single source of truth for image-to-menu mapping. The six photos were inspected
// individually; do not invent additional photographs or reuse a broken asset path.
window.CHICKEN_MENU = Object.freeze([
  {
    id: "layered-sandwich", category: "main", takeout: true,
    name: "多層合成チキンサンド", price: 1480,
    image: "images/hero-slides/slide-1.jpg", imageAlt: "丸いバンズに人工肉やチーズ状の層、緑色の葉菜を幾重にも重ねたサンド",
    badge: "定番", short: "培養チキン、葉菜フォーム、チーズ風シートを重ねたボリュームサンド。",
    description: "培養チキンを中心に、葉菜フォーム、チーズ風シート、香ばしく焼き上げたタンパク質パティを幾層にも重ねました。断面ごとに異なる食感を楽しめる、チキンハウスの定番です。",
    detail: "ソフトバンズ／培養チキンパティ／合成チーズシート／葉菜フォーム", note: "持ち帰り対応"
  },
  {
    id: "seasonal-hamburg", category: "main", takeout: false,
    name: "季節の贅沢合成ハンバーグ", price: 2400,
    image: "images/hero-slides/slide-2.jpg", imageAlt: "褐色ソースに浸した角切りの合成ハンバーグと黄・緑・白色のキューブのプレート",
    badge: "季節限定", short: "角切りハンバーグに濃厚ブラウンソースと彩りキューブを添えて。",
    description: "褐色ソースで仕上げた合成ハンバーグを、食べやすいキューブ状に成形。黄・緑・乳白色の付け合わせを彩りよく盛り付けました。写真のフォークで持ち上げた一切れまで、すべて同じ培養素材です。",
    detail: "合成ハンバーグ／ブラウンソース／三色栄養キューブ", note: "季節限定・店内提供"
  },
  {
    id: "protein-pie", category: "main", takeout: true,
    name: "タンパク質キューブのパイ包み", price: 1680,
    image: "images/hero-slides/slide-4.jpg", imageAlt: "焼き色のついたパイ生地の中に茶色とベージュの角切り素材がぎっしり詰まった料理",
    badge: "おすすめ", short: "香ばしいパイに二色の培養タンパク質を詰めたオーブン料理。",
    description: "サクッと焼いたパイ生地の中に、二種類の味付けを施した角切りタンパク質を詰め込みました。立体的な盛り付けと、ほどけるパイの食感をお楽しみください。",
    detail: "パイ生地／濃色・淡色培養タンパク質／ローストフレーバー", note: "持ち帰り対応"
  },
  {
    id: "standard-plate", category: "main", takeout: true,
    name: "標準栄養プレート", price: 980,
    image: "images/hero-slides/slide-6.jpg", imageAlt: "茶色い立方体にブラウンソースを敷き、別皿に淡い立方体と色とりどりのキューブを添えたセット",
    badge: "定番", short: "主菜キューブにソース、主食ブロックと彩り副菜をセット。",
    description: "ブラウンソースの主菜キューブに、淡色の主食ブロックと四種の彩り副菜を合わせた一皿。チキンハウスの標準的なセットメニューです。",
    detail: "タンパク質ブロック／ブラウンソース／主食ブロック／彩りキューブ", note: "持ち帰り対応"
  },
  {
    id: "cube-parfait", category: "dessert", takeout: false,
    name: "カラーキューブ・パフェ", price: 1080,
    image: "images/hero-slides/slide-3.jpg", imageAlt: "紫、緑、オレンジ、青色のキューブを盛り付けた四種類の背の高いパフェ",
    badge: "デザート", short: "色と食感で選べる、4つのフレーバーのキューブパフェ。",
    description: "紫・緑・橙・青を基調とした四種類のフレーバーをご用意。クリーム状の層、クランチ、角切りゼリーを重ねたパフェです。写真は4種類を並べたものです。価格は1杯あたり。",
    detail: "フレーバーキューブ／クリーム状デザート／クランチ", note: "4フレーバーから1種類を選択"
  },
  {
    id: "custard-tower", category: "dessert", takeout: false,
    name: "栄養カスタードの円筒デザート", price: 780,
    image: "images/hero-slides/slide-5.jpg", imageAlt: "縦筋のあるベージュ色の円筒状デザートに黄色い円柱と小さな彩りキューブを添えた皿",
    badge: "デザート", short: "なめらかなカスタード風の円筒に、フルーツ風キューブを添えて。",
    description: "滑らかな乳白色のカスタード風ベースを円筒状に仕立て、濃黄色のムースと色彩キューブを添えました。軽い甘さと均一な舌触りが特徴です。",
    detail: "カスタード風ベース／黄色ムース／色彩キューブ", note: "店内提供"
  }
]);
