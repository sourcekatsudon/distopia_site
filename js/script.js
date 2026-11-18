"use strict";
(function(){
  const menu=window.CHICKEN_MENU || [];
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function card(item,root=""){
    return '<article class="menu-card"><a href="'+root+'menu.html?id='+encodeURIComponent(item.id)+'" aria-label="'+esc(item.name)+'の詳細"><div class="menu-card-image"><img loading="lazy" src="'+root+esc(item.image)+'" alt="'+esc(item.imageAlt)+'"><span class="menu-badge">'+esc(item.badge)+'</span></div><div class="menu-card-content"><h3>'+esc(item.name)+'</h3><p>'+esc(item.short)+'</p><div class="card-bottom"><span class="card-price">¥'+item.price.toLocaleString('ja-JP')+' <small>税込</small></span><span class="card-arrow" aria-hidden="true">→</span></div></div></a></article>';
  }
  function setupNavigation(){
    const toggle=document.querySelector(".menu-toggle"),nav=document.getElementById("site-nav");
    if(!toggle||!nav)return;
    const close=()=>{nav.classList.remove("is-open");toggle.setAttribute("aria-expanded","false");toggle.setAttribute("aria-label","メニューを開く");};
    toggle.addEventListener("click",()=>{const open=!nav.classList.contains("is-open");nav.classList.toggle("is-open",open);toggle.setAttribute("aria-expanded",String(open));toggle.setAttribute("aria-label",open?"メニューを閉じる":"メニューを開く");});
    nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",close));
    document.addEventListener("keydown",e=>{if(e.key==="Escape")close();});
  }
  function setupCatalog(){
    const grid=document.getElementById("menu-grid");if(!grid)return;
    const buttons=[...document.querySelectorAll("[data-category]")];
    const show=filter=>{
      const subset=menu.filter(m=>filter==="all"||(filter==="takeout"?m.takeout:m.category===filter));
      grid.innerHTML=subset.map(m=>card(m)).join("");
      buttons.forEach(b=>{let on=b.dataset.category===filter;b.classList.toggle("is-active",on);b.setAttribute("aria-pressed",String(on));});
    };
    buttons.forEach(b=>b.addEventListener("click",()=>show(b.dataset.category)));
    document.querySelectorAll("[data-filter-link]").forEach(a=>a.addEventListener("click",()=>show(a.dataset.filterLink)));
    show("all");
  }
  function setupDetail(){
    const mount=document.getElementById("dish-detail");if(!mount)return;
    const id=new URLSearchParams(location.search).get("id"),m=menu.find(i=>i.id===id);
    if(!m){document.title="メニューが見つかりません｜チキンハウス";mount.innerHTML='<div class="wrap" style="padding:80px 0"><h1>商品が見つかりません</h1><p>指定された商品は現在掲載されていません。</p><a class="back-link" href="index.html#menu">← メニュー一覧へ戻る</a></div>';return;}
    document.title=m.name+"｜メニュー｜チキンハウス";
    const back=document.getElementById("detail-breadcrumb-name");if(back)back.textContent=m.name;
    mount.innerHTML='<div class="wrap detail-layout"><div class="detail-image"><img src="'+esc(m.image)+'" alt="'+esc(m.imageAlt)+'"></div><div class="detail-copy"><p class="eyebrow">'+(m.category==="dessert"?"DESSERT":"FOOD MENU")+'</p><span class="menu-badge" style="position:static;display:inline-block;background:#f7e8e7">'+esc(m.badge)+'</span><h1 style="margin-top:16px">'+esc(m.name)+'</h1><p class="detail-description">'+esc(m.description)+'</p><div class="detail-meta"><div class="card-price">¥'+m.price.toLocaleString('ja-JP')+' <small>税込</small></div><span class="small-note">'+esc(m.note)+'</span></div><div class="detail-ingredients"><h2>メニュー構成</h2><p>'+esc(m.detail)+'</p></div><p class="small-note">※ 写真はイメージです。商品は架空の食品です。アレルゲン・栄養成分等の数値は設定されていません。</p><a class="back-link" href="index.html#menu">← メニュー一覧へ戻る</a></div></div>';
    const related=document.getElementById("related-grid");if(related)related.innerHTML=menu.filter(i=>i.id!==m.id).slice(0,3).map(i=>card(i)).join("");
  }
  document.addEventListener("DOMContentLoaded",()=>{setupNavigation();setupCatalog();setupDetail();});
})();
