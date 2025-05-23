// ナビゲーションのモバイルトグル機能
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
    }
    
    // ナビゲーションリンクをクリックしたときのスムーズスクロール
    const navLinks = document.querySelectorAll('header a, footer a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // アンカーリンクかどうかを確認
            const href = this.getAttribute('href');
            
            if (href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // モバイルメニューが開いていれば閉じる
                    if (mainNav.classList.contains('active')) {
                        mainNav.classList.remove('active');
                    }
                    
                    // スムーズスクロール
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // スクロール時のヘッダー背景変更
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.backgroundColor = '#fff';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
    });
    
    // フォーム送信イベント
    const reservationForm = document.querySelector('.reservation-form');
    
    if (reservationForm) {
        reservationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // フォームデータ取得
            const formData = new FormData(this);
            const formDataObj = {};
            
            for (let [key, value] of formData.entries()) {
                formDataObj[key] = value;
            }
            
            // ここでフォームデータを送信する処理を実装
            // 実際にはバックエンドAPIなどにデータを送信
            console.log('予約データ:', formDataObj);
            
            // 送信成功時の処理
            alert('ご予約ありがとうございます。確認メールをお送りしました。');
            this.reset();
        });
    }
    
    // 画像の遅延読み込み
    const lazyImages = document.querySelectorAll('img');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    image.src = image.dataset.src;
                    imageObserver.unobserve(image);
                }
            });
        });
        
        lazyImages.forEach(img => {
            if (img.dataset.src) {
                imageObserver.observe(img);
            }
        });
    } else {
        // Intersection Observerがサポートされていない場合のフォールバック
        lazyImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
    }
    
    // ヒーローセクションのスライドショー機能
    const heroSlideshow = {
        // スライド用画像配列（後で簡単に変更できるようにここに定義）
        slides: [
            'images/hero-slides/slide-1.jpg',
            'images/hero-slides/slide-2.jpg',
            'images/hero-slides/slide-3.jpg',
            'images/hero-slides/slide-4.jpg',
            'images/hero-slides/slide-5.jpg'
        ],
        // スライドの切り替え間隔（ミリ秒）
        interval: 5000,
        // 現在のスライド番号
        currentSlideIndex: 0,
        // タイマーID
        timer: null,        // スライドショーを初期化する関数
        init: function() {
            const slideshowContainer = document.querySelector('.hero-slideshow');
            
            // コンテナが存在しない場合は何もしない
            if (!slideshowContainer) return;
            
            // 画像が存在するかどうかを確認し、ない場合はダミー画像を生成する機能を追加
            const checkImageExists = (url) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => resolve(true);
                    img.onerror = () => resolve(false);
                    img.src = url;
                });
            };

            // スライド要素を作成し、コンテナに追加
            const promises = this.slides.map(async (slide, index) => {
                // 画像の存在確認
                const imageExists = await checkImageExists(slide);
                const slideElement = document.createElement('div');
                slideElement.className = 'hero-slide';
                
                if (imageExists) {
                    // 実際の画像を使用
                    slideElement.style.backgroundImage = `url('${slide}')`;
                } else {
                    // ダミーの背景色を生成（スライドごとに色を変える）
                    const colors = ['#f5762e', '#75a928', '#3498db', '#9b59b6', '#e74c3c'];
                    const bgColor = colors[index % colors.length];
                    slideElement.style.backgroundColor = bgColor;
                    
                    // ダミーのテキストを追加
                    const textElement = document.createElement('div');
                    textElement.style.position = 'absolute';
                    textElement.style.top = '50%';
                    textElement.style.left = '50%';
                    textElement.style.transform = 'translate(-50%, -50%)';
                    textElement.style.color = 'white';
                    textElement.style.fontSize = '24px';
                    textElement.style.fontWeight = 'bold';
                    textElement.style.textAlign = 'center';
                    textElement.innerHTML = `季節の特選メニュー<br>スライド ${index + 1}`;
                    slideElement.appendChild(textElement);
                }
                
                // 最初のスライドだけアクティブにする
                if (index === 0) {
                    slideElement.classList.add('active');
                }
                
                slideshowContainer.appendChild(slideElement);
                return slideElement;
            });
            
            // すべてのスライドの初期化が完了したら、スライドショーを開始
            Promise.all(promises).then(() => {
                // スライド要素を取得
                this.slideElements = document.querySelectorAll('.hero-slide');
                
                // スライドインジケーターを追加
                this.createIndicators();
                
                // スライドが1枚以上あればスライドショーを開始
                if (this.slideElements.length > 1) {
                    this.startSlideshow();
                }
            });
        },
        
        // スライドインジケーターを作成する関数
        createIndicators: function() {
            const hero = document.querySelector('.hero');
            const indicatorsContainer = document.createElement('div');
            indicatorsContainer.className = 'slide-indicators';
            
            for (let i = 0; i < this.slides.length; i++) {
                const indicator = document.createElement('div');
                indicator.className = 'slide-indicator';
                
                // 最初のインジケーターだけアクティブにする
                if (i === 0) {
                    indicator.classList.add('active');
                }
                
                // クリックしたときに対応するスライドに移動
                indicator.addEventListener('click', () => {
                    // 自動スライドショーを一時停止
                    clearInterval(this.timer);
                    
                    // 現在のスライドを非アクティブにする
                    this.slideElements[this.currentSlideIndex].classList.remove('active');
                    document.querySelectorAll('.slide-indicator')[this.currentSlideIndex].classList.remove('active');
                    
                    // クリックされたインジケーターに対応するスライドに移動
                    this.currentSlideIndex = i;
                    
                    // 新しいスライドをアクティブにする
                    this.slideElements[this.currentSlideIndex].classList.add('active');
                    indicator.classList.add('active');
                    
                    // 自動スライドショーを再開
                    this.startSlideshow();
                });
                
                indicatorsContainer.appendChild(indicator);
            }
            
            hero.appendChild(indicatorsContainer);
        },
        
        // スライドショーを開始する関数
        startSlideshow: function() {
            this.timer = setInterval(() => {
                this.nextSlide();
            }, this.interval);
        },
          // 次のスライドに切り替える関数
        nextSlide: function() {
            // 現在のスライドとインジケーターを非アクティブにする
            this.slideElements[this.currentSlideIndex].classList.remove('active');
            
            const indicators = document.querySelectorAll('.slide-indicator');
            if (indicators.length > 0) {
                indicators[this.currentSlideIndex].classList.remove('active');
            }
            
            // インデックスを更新
            this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slideElements.length;
            
            // 新しいスライドとインジケーターをアクティブにする
            this.slideElements[this.currentSlideIndex].classList.add('active');
            
            if (indicators.length > 0) {
                indicators[this.currentSlideIndex].classList.add('active');
            }
        }
    };
    
    // スライドショーの初期化
    heroSlideshow.init();
});
