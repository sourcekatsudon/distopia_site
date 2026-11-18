'use strict';
(function(){
  const W=typeof window!=='undefined'?window:globalThis;
  const menu=W.CHICKEN_MENU||[];
  const PAGE=12;
  const CATEGORIES=['all','recommended','grill','pasta','rice','side','japanese','dessert','takeout'];
  const LABELS={all:'すべて',recommended:'おすすめ',grill:'グリル',pasta:'パスタ',rice:'ごはん',side:'サイド',japanese:'和食',dessert:'デザート',takeout:'お持ち帰り',main:'お食事'};
  const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const yen=n=>'¥'+(Number(n)||0).toLocaleString('ja-JP');
  const norm=s=>String(s==null?'':s).normalize('NFKC').toLowerCase().trim();
  const cat=c=>(CATEGORIES.indexOf(c)>-1||c==='main')?c:'all';

  function inCategory(item,c){
    switch(c){
      case 'recommended':return !!item.recommended;
      case 'takeout':return !!item.takeout;
      case 'grill':case 'pasta':case 'rice':return item.subcategory===c;
      case 'side':case 'japanese':case 'dessert':return item.subcategory===c||item.category===c;
      case 'main':return item.category==='main';
      default:return true;
    }
  }
  function matches(item,category,query){
    if(!item||typeof item!=='object')return false;
    if(!inCategory(item,cat(category)))return false;
    const q=norm(query);
    if(!q)return true;
    const hay=norm([item.name,item.short,item.description].filter(v=>v!=null).join(' '));
    return q.split(/\s+/).every(t=>hay.indexOf(t)>-1);
  }
  function select(list,category,query){
    return (Array.isArray(list)?list:[]).filter(m=>matches(m,category,query));
  }
  W.CHICKEN_CATALOG={matches:matches,select:select};

  function card(item,root){
    root=root||'';
    return '<article class="menu-card"><a href="'+root+'menu.html?id='+encodeURIComponent(item.id)+'" aria-label="'+esc(item.name)+'の詳細"><div class="menu-card-image"><img loading="lazy" src="'+root+esc(item.image)+'" alt="'+esc(item.imageAlt)+'">'+(item.badge?'<span class="menu-badge">'+esc(item.badge)+'</span>':'')+'</div><div class="menu-card-content"><h3>'+esc(item.name)+'</h3><p>'+esc(item.short)+'</p><div class="card-bottom"><span class="card-price">'+yen(item.price)+' <small>税込</small></span><span class="card-arrow" aria-hidden="true">→</span></div></div></a></article>';
  }

  function setupNavigation(){
    const toggle=document.querySelector('.menu-toggle'),nav=document.getElementById('site-nav');
    if(!toggle||!nav)return;
    const close=()=>{nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','メニューを開く');};
    toggle.addEventListener('click',()=>{const open=!nav.classList.contains('is-open');nav.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'メニューを閉じる':'メニューを開く');});
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('is-open')){const restore=nav.contains(document.activeElement);close();if(restore)toggle.focus();}});
  }

  function setupFeatures(){
    document.querySelectorAll('[data-feature-id]').forEach(sec=>{
      const m=menu.find(i=>i.id===sec.getAttribute('data-feature-id'));
      if(!m)return;
      const q=a=>sec.querySelector('['+a+']');
      const img=q('data-feature-image'),name=q('data-feature-name'),price=q('data-feature-price'),short=q('data-feature-short'),link=q('data-feature-link');
      if(img){img.setAttribute('src',m.image||'');img.setAttribute('alt',m.imageAlt||'');img.hidden=false;}
      if(name){name.textContent=m.name||'';name.hidden=false;}
      if(price){price.innerHTML=yen(m.price)+' <small>税込</small>';price.hidden=false;}
      if(short){short.textContent=m.short||'';short.hidden=false;}
      if(link){link.setAttribute('href','menu.html?id='+encodeURIComponent(m.id));link.hidden=false;}
      sec.classList.add('is-feature-ready');
    });
  }

  function readState(){
    const p=new URLSearchParams(location.search);
    return {category:cat(p.get('category')),q:p.get('q')||''};
  }
  function writeState(s){
    try{
      const p=new URLSearchParams(location.search);
      if(s.category==='all')p.delete('category');else p.set('category',s.category);
      const q=s.q.trim();
      if(q)p.set('q',q);else p.delete('q');
      const qs=p.toString();
      history.replaceState(null,'',location.pathname+(qs?'?'+qs:'')+location.hash);
    }catch(e){}
  }

  function setupCatalog(){
    const grid=document.getElementById('menu-grid');
    if(!grid)return;
    const controls=document.getElementById('menu-controls'),form=document.getElementById('menu-search-form'),input=document.getElementById('menu-search'),status=document.getElementById('menu-count'),reset=document.getElementById('menu-reset'),more=document.getElementById('menu-more');
    const buttons=[...document.querySelectorAll('button[data-category]')];
    let state=readState(),visible=PAGE,list=[],timer=0;
    if(controls)controls.hidden=false;
    const syncControls=()=>{
      buttons.forEach(b=>{const on=b.dataset.category===state.category;b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',String(on));});
      if(input&&input.value!==state.q)input.value=state.q;
      if(reset)reset.hidden=!state.q.trim();
    };
    const updateStatus=()=>{
      const total=list.length,shown=Math.min(visible,total),q=state.q.trim();
      if(status)status.textContent=(LABELS[state.category]||'すべて')+(q?'「'+q+'」':'')+'：'+(total?total+'件中 '+shown+'件を表示しています。':'該当するメニューはありません。');
      if(more){
        more.hidden=shown>=total;
        if(!more.hidden)more.textContent='さらに表示する（残り'+(total-shown)+'件）';
      }
    };
    const render=()=>{
      visible=PAGE;
      list=select(menu,state.category,state.q);
      grid.innerHTML=list.length?list.slice(0,visible).map(m=>card(m)).join(''):'<p class="menu-empty">条件に一致するメニューがありません。カテゴリやキーワードを変えてお試しください。</p>';
      syncControls();
      updateStatus();
    };
    const commit=()=>{render();writeState(state);};
    const loadMore=()=>{
      const prev=visible;
      visible=Math.min(list.length,prev+PAGE);
      grid.insertAdjacentHTML('beforeend',list.slice(prev,visible).map(m=>card(m)).join(''));
      updateStatus();
      const first=grid.children[prev],link=first&&first.querySelector('a');
      if(link)link.focus();
    };
    const applyQuery=()=>{clearTimeout(timer);const q=input?input.value:'';if(q===state.q)return;state.q=q;commit();};
    buttons.forEach(b=>b.addEventListener('click',()=>{clearTimeout(timer);state.q=input?input.value:state.q;state.category=cat(b.dataset.category);commit();}));
    document.querySelectorAll('[data-filter-link]').forEach(a=>a.addEventListener('click',()=>{clearTimeout(timer);state={category:cat(a.dataset.filterLink),q:''};commit();}));
    if(input){
      input.addEventListener('input',e=>{if(e.isComposing)return;clearTimeout(timer);timer=setTimeout(applyQuery,180);});
      input.addEventListener('compositionend',()=>{clearTimeout(timer);timer=setTimeout(applyQuery,180);});
    }
    if(form)form.addEventListener('submit',e=>{e.preventDefault();applyQuery();});
    if(reset)reset.addEventListener('click',()=>{clearTimeout(timer);state.q='';if(input)input.value='';commit();if(input)input.focus();});
    if(more)more.addEventListener('click',loadMore);
    window.addEventListener('popstate',()=>{clearTimeout(timer);const next=readState();if(next.category===state.category&&next.q===state.q)return;state=next;render();});
    render();
    writeState(state);
  }

  function galleryOf(m){
    const out=[{image:m.image,imageAlt:m.imageAlt||''}];
    (Array.isArray(m.gallery)?m.gallery:[]).forEach(g=>{
      if(g&&g.image&&!out.some(o=>o.image===g.image))out.push({image:g.image,imageAlt:g.imageAlt||m.imageAlt||''});
    });
    return out;
  }
  function relatedOf(m){
    const others=menu.filter(i=>i.id!==m.id);
    const sub=others.filter(i=>m.subcategory&&i.subcategory===m.subcategory);
    const same=others.filter(i=>sub.indexOf(i)<0&&i.category===m.category);
    return sub.concat(same).slice(0,3);
  }

  function setupDetail(){
    const mount=document.getElementById('dish-detail');
    if(!mount)return;
    const id=new URLSearchParams(location.search).get('id'),m=menu.find(i=>i.id===id);
    if(!m){
      document.title='メニューが見つかりません｜チキンハウス';
      const related=document.querySelector('.related-section');if(related)related.hidden=true;
      const crumb=document.getElementById('detail-breadcrumb-name');if(crumb)crumb.textContent='商品が見つかりません';
      mount.innerHTML='<div class="wrap" style="padding:80px 0"><h1>商品が見つかりません</h1><p>指定された商品は現在掲載されていません。</p><a class="back-link" href="index.html#menu">← メニュー一覧へ戻る</a></div>';
      return;
    }
    document.title=m.name+'｜メニュー｜チキンハウス';
    const back=document.getElementById('detail-breadcrumb-name');
    if(back)back.textContent=m.name;
    const images=galleryOf(m);
    const thumbs=images.length>1?'<ul class="gallery-thumbs" aria-label="写真の切り替え">'+images.map((g,i)=>'<li><button type="button" class="gallery-thumb" data-index="'+i+'" aria-pressed="'+String(i===0)+'" aria-label="写真'+(i+1)+'を表示：'+esc(g.imageAlt)+'"><img src="'+esc(g.image)+'" alt="" loading="lazy"></button></li>').join('')+'</ul>':'';
    const dessert=m.category==='dessert'||m.subcategory==='dessert';
    mount.innerHTML='<div class="wrap detail-layout"><div class="detail-gallery"><div class="detail-image"><img id="detail-main-image" src="'+esc(m.image)+'" alt="'+esc(m.imageAlt)+'"></div>'+thumbs+'</div><div class="detail-copy"><p class="eyebrow">'+(dessert?'DESSERT':'FOOD MENU')+'</p>'+(m.badge?'<span class="menu-badge" style="position:static;display:inline-block;background:#f7e8e7">'+esc(m.badge)+'</span>':'')+'<h1 style="margin-top:16px">'+esc(m.name)+'</h1><p class="detail-description">'+esc(m.description)+'</p><div class="detail-meta"><div class="card-price">'+yen(m.price)+' <small>税込</small></div><span class="small-note">'+esc(m.note)+'</span></div><div class="detail-ingredients"><h2>メニュー構成</h2><p>'+esc(m.detail)+'</p></div><p class="small-note">※ 写真はイメージです。商品は架空の食品です。アレルゲン・栄養成分等の数値は設定されていません。</p><a class="back-link" href="index.html#menu">← メニュー一覧へ戻る</a></div></div>';
    const strip=mount.querySelector('.gallery-thumbs'),main=document.getElementById('detail-main-image');
    if(strip&&main)strip.addEventListener('click',e=>{
      const b=e.target.closest('button[data-index]');
      if(!b||!strip.contains(b))return;
      const g=images[Number(b.dataset.index)];
      if(!g)return;
      main.setAttribute('src',g.image);
      main.setAttribute('alt',g.imageAlt);
      strip.querySelectorAll('button[data-index]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
    });
    const relatedGrid=document.getElementById('related-grid');
    if(relatedGrid){
      const rel=relatedOf(m);
      relatedGrid.innerHTML=rel.map(i=>card(i)).join('');
      const sec=relatedGrid.closest('.related-section');
      if(sec)sec.hidden=!rel.length;
    }
  }

  if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',()=>{setupNavigation();setupFeatures();setupCatalog();setupDetail();});
})();
