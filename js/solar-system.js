// 3D太陽系のアクセスマップ用スクリプト
// Three.jsを利用したWebGL実装

let scene, camera, renderer;
let planets = {};
let orbitControls;
let raycaster;
let mouse;
let hoveredPlanet = null;
let branchInfo = {
    "sun": {
        name: "チキンハウス 太陽本店",
        address: "東京都千代田区千代田1-1",
        access: "東京駅から徒歩5分",
        tel: "03-1234-5678",
        hours: "ランチ 11:00-15:00 / ディナー 17:00-22:00"
    },
    "earth": {
        name: "チキンハウス 地球支店",
        address: "埼玉県新座市東北2-30-10",
        access: "新座駅から徒歩10分",
        tel: "048-1234-5678",
        hours: "ランチ 11:00-15:00 / ディナー 17:00-22:00"
    },
    "mars": {
        name: "チキンハウス 火星支店",
        address: "大阪府大阪市北区梅田3-1-3",
        access: "大阪駅から徒歩7分",
        tel: "06-1234-5678",
        hours: "ランチ 11:00-15:00 / ディナー 17:00-22:00"
    },
    "callisto": {
        name: "チキンハウス カリスト支店",
        address: "福岡県福岡市博多区博多駅前2-1-1",
        access: "博多駅から徒歩3分",
        tel: "092-1234-5678",
        hours: "ランチ 11:00-15:00 / ディナー 17:00-22:00"
    },
    "neptune": {
        name: "チキンハウス 海王星支店",
        address: "北海道札幌市中央区北1条西2丁目",
        access: "札幌駅から徒歩8分",
        tel: "011-1234-5678",
        hours: "ランチ 11:00-15:00 / ディナー 17:00-22:00"
    }
};

function initSolarSystem() {
    console.log('ソーラーシステム初期化開始...');
    
    // シーンの初期化
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf9f5f0);    // カメラの設定
    const container = document.getElementById('solar-system');
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 50, 115); // 視点を少し遠ざけて全体を見やすく調整
    camera.lookAt(0, 0, 0);

    // レンダラーの設定
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
      // OrbitControls の追加
    try {
        const OrbitControls = THREE.OrbitControls || (window.OrbitControls);
        if (OrbitControls) {
            orbitControls = new OrbitControls(camera, renderer.domElement);
            orbitControls.enableDamping = true;
            orbitControls.dampingFactor = 0.05;
            orbitControls.screenSpacePanning = false;
            orbitControls.minDistance = 20;
            orbitControls.maxDistance = 200;
            orbitControls.maxPolarAngle = Math.PI / 2;
            console.log('OrbitControls 初期化成功');
        } else {
            console.log('OrbitControls が利用できません');
        }
    } catch (e) {
        console.error('OrbitControls 初期化エラー:', e);
    }

    // 光源の追加
    // 環境光（全体を明るく）
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // 太陽からの光（ポイントライト）
    const sunLight = new THREE.PointLight(0xffffff, 2, 300);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    scene.add(sunLight);
    
    // 太陽の周りに明るさを演出するための光源
    const sunGlow = new THREE.PointLight(0xffff99, 1, 20);
    sunGlow.position.set(0, 0, 0);
    scene.add(sunGlow);

    // 全体を照らす方向光源（ディレクショナルライト）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(100, 100, 100);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // 惑星の作成
    createPlanets();

    // 軌道の作成
    createOrbits();
    
    // 背景の星を追加
    createStars();

    // レイキャスターの初期化（マウスオーバー検出用）
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // イベントリスナーの設定
    container.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

    // アニメーションの開始
    animate();
}

// 背景に星を追加する関数
function createStars() {
    // 星の数
    const starsCount = 1000;
    
    // 星のジオメトリとマテリアル
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
        transparent: true,
        opacity: 0.8
    });
    
    // 星の位置をランダムに設定
    const positions = new Float32Array(starsCount * 3);
    
    for (let i = 0; i < starsCount * 3; i += 3) {
        // 球面上にランダムに配置
        const radius = 250 + Math.random() * 50; // 背景の球の半径
        const theta = Math.random() * Math.PI * 2; // 経度
        const phi = Math.acos(2 * Math.random() - 1); // 緯度
        
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // 星のパーティクルシステムを作成
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

function createPlanets() {    
    // テクスチャローダーの作成
    const textureLoader = new THREE.TextureLoader();
      // SVGをテクスチャとして使用するためのヘルパー関数
    const loadSVGTexture = (path) => {
        return new Promise((resolve) => {
            // SVG画像を読み込む
            const img = new Image();
            img.onload = function() {
                // キャンバスを作成
                const canvas = document.createElement('canvas');
                canvas.width = 1024;
                canvas.height = 1024;
                const ctx = canvas.getContext('2d');
                
                // キャンバスを一度クリア
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // SVG画像をキャンバスに描画
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // キャンバスからテクスチャを作成
                const texture = new THREE.CanvasTexture(canvas);
                // テクスチャマッピングの設定を追加
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);
                texture.needsUpdate = true;
                
                console.log(`SVGテクスチャ読み込み成功: ${path}`);
                resolve(texture);
            };
            
            img.onerror = function(error) {
                console.error(`SVGテクスチャ読み込みエラー: ${path}`, error);
                // エラー時はダミーテクスチャを返す
                const canvas = document.createElement('canvas');
                canvas.width = 1024;
                canvas.height = 1024;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = 'magenta'; // エラー時は目立つ色
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // テキストでエラーを表示
                ctx.fillStyle = 'white';
                ctx.font = '24px Arial';
                ctx.fillText(`Error loading: ${path}`, 100, 512);
                
                const fallbackTexture = new THREE.CanvasTexture(canvas);
                resolve(fallbackTexture);
            };
            
            // クロスオリジン問題を回避
            img.crossOrigin = "Anonymous";
            img.src = path;
        });
    };
      // 通常のテクスチャローダー（フォールバック用）
    const loadTexture = (path) => {
        return new Promise((resolve) => {
            textureLoader.load(
                path,
                (texture) => {
                    console.log(`テクスチャ読み込み成功: ${path}`);
                    // テクスチャマッピングの設定を追加
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.set(1, 1);
                    texture.needsUpdate = true;
                    resolve(texture);
                },
                (xhr) => {
                    console.log(`${path}: ${(xhr.loaded / xhr.total * 100)}% 読み込み完了`);
                },
                (error) => {
                    console.error(`テクスチャ読み込みエラー: ${path}`, error);
                    // SVGの読み込みを試みる
                    loadSVGTexture(path)
                        .then(texture => resolve(texture))
                        .catch(() => {
                            // エラー時はダミーテクスチャを返す
                            const canvas = document.createElement('canvas');
                            canvas.width = 512; // 解像度を上げる
                            canvas.height = 512;
                            const context = canvas.getContext('2d');
                            context.fillStyle = 'magenta'; // エラー時は目立つ色
                            context.fillRect(0, 0, 512, 512);
                            // エラーテキストを表示
                            context.fillStyle = 'white';
                            context.font = '24px Arial';
                            context.fillText(`Error loading: ${path}`, 50, 256);
                            const fallbackTexture = new THREE.CanvasTexture(canvas);
                            resolve(fallbackTexture);
                        });
                }
            );
        });
    };// 太陽
    const sunGeometry = new THREE.SphereGeometry(7.5, 32, 32); // 5 * 1.5 = 7.5
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff, // 白でテクスチャの色を維持
        emissive: 0xffff00,
        emissiveIntensity: 0.5
    });
    planets.sun = new THREE.Mesh(sunGeometry, sunMaterial);
    planets.sun.name = "sun";
    
    // 非同期でテクスチャを読み込み
    loadSVGTexture('images/sun_texture.svg')
        .then(texture => {
            sunMaterial.map = texture;
            sunMaterial.needsUpdate = true;
        });
        
    // 太陽の当たり判定用の透明な球体（大きめ）
    const sunHitGeometry = new THREE.SphereGeometry(12, 16, 16); // 8 * 1.5 = 12
    const invisibleMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false
    });
    const sunHitArea = new THREE.Mesh(sunHitGeometry, invisibleMaterial);
    sunHitArea.name = "sun";
    planets.sun.add(sunHitArea);
    
    scene.add(planets.sun);    // 地球
    const earthGeometry = new THREE.SphereGeometry(3, 32, 32); // 2 * 1.5 = 3
    const earthMaterial = new THREE.MeshLambertMaterial({
        color: 0xffffff, // 白でテクスチャの色を維持
        side: THREE.FrontSide
    });
    planets.earth = new THREE.Mesh(earthGeometry, earthMaterial);
    planets.earth.position.set(20, 0, 0);
    planets.earth.name = "earth";
    
    // 非同期でテクスチャを読み込み
    loadSVGTexture('images/earth_texture.svg')
        .then(texture => {
            earthMaterial.map = texture;
            // テクスチャが適用された後にマテリアルを更新
            earthMaterial.needsUpdate = true;
        });
    
    // 地球の当たり判定用の透明な球体
    const earthHitGeometry = new THREE.SphereGeometry(6, 16, 16); // 4 * 1.5 = 6
    const earthHitArea = new THREE.Mesh(earthHitGeometry, invisibleMaterial);
    earthHitArea.name = "earth";
    planets.earth.add(earthHitArea);
    
    scene.add(planets.earth);    // 火星
    const marsGeometry = new THREE.SphereGeometry(2.7, 32, 32); // 1.8 * 1.5 = 2.7
    const marsMaterial = new THREE.MeshLambertMaterial({
        color: 0xffffff, // 白でテクスチャの色を維持
        side: THREE.FrontSide
    });
    planets.mars = new THREE.Mesh(marsGeometry, marsMaterial);
    planets.mars.position.set(30, 0, 0);
    planets.mars.name = "mars";
    
    // 非同期でテクスチャを読み込み
    loadSVGTexture('images/mars_texture.svg')
        .then(texture => {
            marsMaterial.map = texture;
            // テクスチャが適用された後にマテリアルを更新
            marsMaterial.needsUpdate = true;
        });
    
    // 火星の当たり判定用の透明な球体
    const marsHitGeometry = new THREE.SphereGeometry(5.4, 16, 16); // 3.6 * 1.5 = 5.4
    const marsHitArea = new THREE.Mesh(marsHitGeometry, invisibleMaterial);
    marsHitArea.name = "mars";
    planets.mars.add(marsHitArea);
    
    scene.add(planets.mars);    // カリスト（木星の衛星として表現）
    const callistoGeometry = new THREE.SphereGeometry(2.25, 32, 32); // 1.5 * 1.5 = 2.25
    const callistoMaterial = new THREE.MeshLambertMaterial({
        color: 0xffffff, // 白でテクスチャの色を維持
        side: THREE.FrontSide
    });
    planets.callisto = new THREE.Mesh(callistoGeometry, callistoMaterial);
    planets.callisto.position.set(45, 0, 0);
    planets.callisto.name = "callisto";
    
    // 非同期でテクスチャを読み込み
    loadSVGTexture('images/callisto_texture.svg')
        .then(texture => {
            callistoMaterial.map = texture;
            // テクスチャが適用された後にマテリアルを更新
            callistoMaterial.needsUpdate = true;
        });
    
    // カリストの当たり判定用の透明な球体
    const callistoHitGeometry = new THREE.SphereGeometry(4.5, 16, 16); // 3 * 1.5 = 4.5
    const callistoHitArea = new THREE.Mesh(callistoHitGeometry, invisibleMaterial);
    callistoHitArea.name = "callisto";
    planets.callisto.add(callistoHitArea);
    
    scene.add(planets.callisto);    // 海王星
    const neptuneGeometry = new THREE.SphereGeometry(3.3, 32, 32); // 2.2 * 1.5 = 3.3
    const neptuneMaterial = new THREE.MeshLambertMaterial({
        color: 0xffffff, // 白でテクスチャの色を維持
        side: THREE.FrontSide
    });
    planets.neptune = new THREE.Mesh(neptuneGeometry, neptuneMaterial);
    planets.neptune.position.set(60, 0, 0);
    planets.neptune.name = "neptune";
    
    // 非同期でテクスチャを読み込み
    loadSVGTexture('images/neptune_texture.svg')
        .then(texture => {
            neptuneMaterial.map = texture;
            // テクスチャが適用された後にマテリアルを更新
            neptuneMaterial.needsUpdate = true;
        });
    
    // 海王星の当たり判定用の透明な球体
    const neptuneHitGeometry = new THREE.SphereGeometry(6.6, 16, 16); // 4.4 * 1.5 = 6.6
    const neptuneHitArea = new THREE.Mesh(neptuneHitGeometry, invisibleMaterial);
    neptuneHitArea.name = "neptune";
    planets.neptune.add(neptuneHitArea);
    
    scene.add(planets.neptune);    // その他の小さな惑星（水星、金星）
    const smallPlanetGeometry = new THREE.SphereGeometry(1.2, 32, 32); // 0.8 * 1.5 = 1.2
    
    // 水星
    const mercuryMaterial = new THREE.MeshLambertMaterial({
        color: 0xffffff, // 白でテクスチャの色を維持
        side: THREE.FrontSide
    });
    const mercury = new THREE.Mesh(smallPlanetGeometry, mercuryMaterial);
    mercury.position.set(10, 0, 0);
    scene.add(mercury);
    
    // 非同期でテクスチャを読み込み
    loadSVGTexture('images/mercury_texture.svg')
        .then(texture => {
            mercuryMaterial.map = texture;
            mercuryMaterial.needsUpdate = true;
        });

    // 金星
    const venusMaterial = new THREE.MeshLambertMaterial({
        color: 0xffffff, // 白でテクスチャの色を維持
        side: THREE.FrontSide
    });
    const venus = new THREE.Mesh(smallPlanetGeometry, venusMaterial);
    venus.position.set(15, 0, 0);
    scene.add(venus);
    
    // 非同期でテクスチャを読み込み
    loadSVGTexture('images/venus_texture.svg')
        .then(texture => {
            venusMaterial.map = texture;
            venusMaterial.needsUpdate = true;
        });    // 木星
    const jupiterGeometry = new THREE.SphereGeometry(1.8, 32, 32); // 1.2 * 1.5 = 1.8
    const jupiterMaterial = new THREE.MeshLambertMaterial({
        color: 0xffffff, // 白でテクスチャの色を維持
        side: THREE.FrontSide
    });
    const jupiter = new THREE.Mesh(jupiterGeometry, jupiterMaterial);
    jupiter.position.set(38, 0, 0);
    scene.add(jupiter);
    
    // 非同期でテクスチャを読み込み
    loadSVGTexture('images/jupiter_texture.svg')
        .then(texture => {
            jupiterMaterial.map = texture;
            jupiterMaterial.needsUpdate = true;
        });    // 土星
    const saturnGeometry = new THREE.SphereGeometry(1.65, 32, 32); // 1.1 * 1.5 = 1.65
    const saturnMaterial = new THREE.MeshLambertMaterial({
        color: 0xffffff, // 白でテクスチャの色を維持
        side: THREE.FrontSide
    });
    const saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);
    saturn.position.set(52, 0, 0);
    scene.add(saturn);
    
    // 非同期でテクスチャを読み込み
    loadSVGTexture('images/saturn_texture.svg')
        .then(texture => {
            saturnMaterial.map = texture;
            saturnMaterial.needsUpdate = true;
        });    // 天王星
    const uranusGeometry = new THREE.SphereGeometry(1.5, 32, 32); // 1.0 * 1.5 = 1.5
    const uranusMaterial = new THREE.MeshLambertMaterial({
        color: 0xffffff, // 白でテクスチャの色を維持
        side: THREE.FrontSide
    });
    const uranus = new THREE.Mesh(uranusGeometry, uranusMaterial);
    uranus.position.set(55, 0, 0);
    scene.add(uranus);
    
    // 非同期でテクスチャを読み込み
    loadSVGTexture('images/uranus_texture.svg')
        .then(texture => {
            uranusMaterial.map = texture;
            uranusMaterial.needsUpdate = true;
        });
}

function createOrbits() {
    // 軌道の作成
    const orbitRadii = [10, 15, 20, 30, 38, 45, 52, 55, 60];
    const orbitColors = [
        0xcccccc, // 水星
        0xdda0dd, // 金星
        0x6495ed, // 地球
        0xff6347, // 火星
        0xffa500, // 木星
        0xf5deb3, // 土星
        0x00bfff, // 天王星
        0x4169e1, // 海王星
        0x9370db  // その他
    ];
    
    orbitRadii.forEach((radius, index) => {
        // 中心に近いほど明るく、遠いほど暗くなるように
        const opacityFactor = 0.5 - (index * 0.03);
        const orbitGeometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 64);
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: orbitColors[index],
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3 + opacityFactor
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);
    });
      // 太陽の周りに光の輪を追加
    const sunGlowGeometry = new THREE.RingGeometry(8.25, 10.5, 64); // 5.5*1.5=8.25, 7*1.5=10.5
    const sunGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
    });
    const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
    sunGlow.rotation.x = Math.PI / 2;
    scene.add(sunGlow);
}

function onMouseMove(event) {
    // マウス位置の正規化
    const container = document.getElementById('solar-system');
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

    // レイキャスト
    raycaster.setFromCamera(mouse, camera);
    
    // シーン内のすべてのオブジェクトに対してレイキャスト
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    // ポップアップの表示制御
    const popup = document.getElementById('planet-popup');
    
    if (intersects.length > 0) {
        // 交差したオブジェクトを検索
        let planetName = null;
        
        for (let i = 0; i < intersects.length; i++) {
            const object = intersects[i].object;
            
            // オブジェクト自体の名前をチェック
            if (object.name in branchInfo) {
                planetName = object.name;
                break;
            }
            
            // 親オブジェクトの名前をチェック (当たり判定用の透明オブジェクトの場合)
            if (object.parent && object.parent.name in branchInfo) {
                planetName = object.parent.name;
                break;
            }
        }
        
        if (planetName && planetName !== hoveredPlanet) {
            hoveredPlanet = planetName;
            
            // ポップアップの内容を更新
            const info = branchInfo[hoveredPlanet];
            document.getElementById('branch-name').textContent = info.name;
            document.getElementById('branch-address').textContent = info.address;
            document.getElementById('branch-access').textContent = info.access;
            document.getElementById('branch-tel').textContent = info.tel;
            document.getElementById('branch-hours').textContent = info.hours;
            
            // ポップアップの位置調整とアニメーション
            popup.style.display = 'block';
            popup.style.opacity = '0';
            setTimeout(() => {
                popup.style.opacity = '1';
            }, 10);
            
            // 惑星オブジェクトを取得
            const planet = planets[hoveredPlanet];
              // カメラを惑星に向ける（緩やかに）
            new TWEEN.Tween(camera.position)
                .to({
                    x: planet.position.x * 0.8,
                    y: 25, // 20 * 1.25
                    z: 75  // 60 * 1.25
                }, 1000)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
                
            // 惑星を一時的に大きくする
            new TWEEN.Tween(planet.scale)
                .to({ x: 1.3, y: 1.3, z: 1.3 }, 300)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
        }
    } else {
        if (hoveredPlanet !== null) {
            // ホバーが外れたら元の大きさに戻す
            const planet = planets[hoveredPlanet];
            if (planet) {
                new TWEEN.Tween(planet.scale)
                    .to({ x: 1, y: 1, z: 1 }, 300)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .start();
            }
              // カメラを元の位置に戻す
            new TWEEN.Tween(camera.position)
                .to({ x: 0, y: 50, z: 115 }, 1000) // 調整したカメラの初期位置に合わせる
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
                
            // ポップアップを非表示
            popup.style.opacity = '0';
            setTimeout(() => {
                popup.style.display = 'none';
            }, 300);
            
            hoveredPlanet = null;
        }
    }
}

function onWindowResize() {
    const container = document.getElementById('solar-system');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function animate() {
    requestAnimationFrame(animate);
    
    // 惑星の回転
    planets.sun.rotation.y += 0.002;
    planets.earth.rotation.y += 0.01;
    planets.mars.rotation.y += 0.008;
    planets.callisto.rotation.y += 0.006;
    planets.neptune.rotation.y += 0.004;
    
    // 軌道上の動き（非常にゆっくりと）
    const time = Date.now() * 0.0001;
    
    // 地球の公転
    planets.earth.position.x = Math.cos(time * 0.5) * 20;
    planets.earth.position.z = Math.sin(time * 0.5) * 20;
    
    // 火星の公転
    planets.mars.position.x = Math.cos(time * 0.4 + Math.PI * 0.5) * 30;
    planets.mars.position.z = Math.sin(time * 0.4 + Math.PI * 0.5) * 30;
    
    // カリストの公転
    planets.callisto.position.x = Math.cos(time * 0.3 + Math.PI) * 45;
    planets.callisto.position.z = Math.sin(time * 0.3 + Math.PI) * 45;
    
    // 海王星の公転
    planets.neptune.position.x = Math.cos(time * 0.2 + Math.PI * 1.5) * 60;
    planets.neptune.position.z = Math.sin(time * 0.2 + Math.PI * 1.5) * 60;
    
    // 惑星が傾きながら公転するように
    planets.earth.rotation.x = Math.sin(time * 0.2) * 0.1;
    planets.mars.rotation.x = Math.sin(time * 0.15) * 0.15;
    planets.callisto.rotation.x = Math.sin(time * 0.1) * 0.2;
    planets.neptune.rotation.x = Math.sin(time * 0.05) * 0.1;
    
    // OrbitControlsの更新（存在する場合）
    if (orbitControls) {
        orbitControls.update();
    }
    
    // Tweenのアップデート
    TWEEN.update();
    
    renderer.render(scene, camera);
}

// ページ読み込み完了時に初期化
window.addEventListener('DOMContentLoaded', () => {
    // Three.jsとTweenがロードされているか確認
    if (typeof THREE === 'undefined') {
        console.error('THREE.js is not loaded');
        return;
    }
    
    if (typeof TWEEN === 'undefined') {
        console.error('TWEEN.js is not loaded');
        return;
    }
    
    // ソーラーシステムの初期化
    initSolarSystem();
});
