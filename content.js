(()=>{var C=`/*
 * Reskin cho facebook.com/messages khi b\u1ECB nh\xFAng trong Messenger Panel.
 * M\u1ECDi selector \u0111\u1EC1u n\u1EB1m trong html[data-mbx] n\xEAn tab Facebook b\xECnh th\u01B0\u1EDDng KH\xD4NG b\u1ECB \u1EA3nh h\u01B0\u1EDFng.
 * Facebook hay \u0111\u1ED5i DOM; n\u1EBFu UI trong khung b\u1ECB v\u1EE1, t\u1EAFt "Giao di\u1EC7n g\u1ECDn" trong C\xE0i \u0111\u1EB7t,
 * ho\u1EB7c s\u1EEDa file n\xE0y r\u1ED3i ch\u1EA1y \`npm run build\`.
 */

/* B\u1ECF thanh tr\xEAn c\xF9ng c\u1EE7a Facebook (panel \u0111\xE3 c\xF3 app bar ri\xEAng) */
html[data-mbx] {
  --header-height: 0px !important;
  overscroll-behavior: none;
}
html[data-mbx] [role="banner"] {
  display: none !important;
}
html[data-mbx] body {
  margin: 0;
}

/* Thanh cu\u1ED9n m\u1EA3nh cho v\u1EEBa panel h\u1EB9p */
html[data-mbx] ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
html[data-mbx] ::-webkit-scrollbar-track {
  background: transparent;
}
html[data-mbx] ::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.45);
  border-radius: 3px;
}

/* Hi\u1EC7u \u1EE9ng nh\xE1y \xF4 t\xECm ki\u1EBFm khi b\u1EA5m n\xFAt t\xECm ki\u1EBFm \u1EDF app bar */
@keyframes mbx-flash {
  0%   { box-shadow: 0 0 0 0 rgba(91, 108, 240, 0.65); }
  100% { box-shadow: 0 0 0 10px rgba(91, 108, 240, 0); }
}
html[data-mbx] .mbx-flash {
  animation: mbx-flash 0.7s ease-out 1;
  border-radius: 24px;
}
`;(()=>{let f=new URL(chrome.runtime.getURL("/")).origin,S=Array.from(location.ancestorOrigins||[]);if(window===window.top||S[0]!==f)return;let c=(window.name||"").startsWith("mbx-")?window.name.slice(4):"fn",m=t=>parent.postMessage({__mbx:1,role:c,...t},f),x=t=>new Promise(e=>setTimeout(e,t)),w='a[href*="/messages/t/"], a[href*="/messages/e2ee/t/"]',y="mbx-style";function v(t){let e=document.documentElement;if(!e)return;let n=document.getElementById(y);t?(e.dataset.mbx=c,n||(n=document.createElement("style"),n.id=y,n.textContent=C,(document.head||e).appendChild(n))):(n?.remove(),delete e.dataset.mbx)}chrome.storage.local.get({compact:!0}).then(t=>v(t.compact)),chrome.storage.onChanged.addListener((t,e)=>{e==="local"&&t.compact&&v(!!t.compact.newValue)});let q=/^\/messages\/(e2ee\/)?t\/[A-Za-z0-9._-]+\/?$/,E=/^(active|đang hoạt động|hoạt động|online|offline|typing|đang nhập|you:|bạn:|·|\d+\s?[smhdwy]$)/i;function R(t){let e=t.closest('[role="row"], [role="listitem"], li')||t;for(let n of e.querySelectorAll("span")){let a=n.textContent.trim();if(a&&a.length<80&&!E.test(a))return a}return(t.getAttribute("aria-label")||"").trim()}if(c!=="chat"&&document.addEventListener("click",t=>{if(t.button!==0||t.ctrlKey||t.metaKey||t.shiftKey||t.altKey)return;let e=t.target instanceof Element&&t.target.closest('a[href*="/messages/"]');if(!e)return;let n;try{n=new URL(e.href,location.href)}catch{return}n.origin!==location.origin||!q.test(n.pathname)||(t.preventDefault(),t.stopImmediatePropagation(),m({t:"thread",path:n.pathname,name:R(e)}))},!0),c==="chat"){let l=function(){let o=document.querySelector('[role="main"]');if(!o)return null;let r=o.getBoundingClientRect();return r.width>150&&r.left>=100?o:null},s=function(){let o=document.querySelector('[role="textbox"][contenteditable="true"]');if(!o)return null;let r=o;for(;r.parentElement&&r.parentElement!==document.body&&!r.parentElement.querySelector(w);)r=r.parentElement;let i=r.getBoundingClientRect();return i.width>150&&i.left>=100?r:null},t=document.createElement("style");t.textContent="html[data-mbx-pane]{width:var(--mbx-w,100vw)!important;height:100%!important;overflow:hidden!important}html[data-mbx-pane] body{position:relative!important;width:var(--mbx-w,100vw)!important;height:100vh!important;margin:0!important;overflow:hidden!important;transform:translateZ(0)!important}html[data-mbx-pane] [data-mbx-root]{position:relative!important;left:calc(-1 * var(--mbx-l,0px))!important;width:calc(var(--mbx-l,0px) + var(--mbx-w,100vw) + 520px)!important;min-width:0!important;max-width:none!important;overflow:hidden!important}html[data-mbx-pane] [data-mbx-main]{flex:0 0 auto!important;width:calc(var(--mbx-w,100vw) - 2 * var(--mbx-gap,0px))!important;min-width:0!important;max-width:none!important}",(document.head||document.documentElement).appendChild(t);let e=null,n=0,a=()=>{let o=document.documentElement;n&&o.style.setProperty("--mbx-w",n+"px"),e!=null&&(o.style.setProperty("--mbx-l",e+"px"),o.setAttribute("data-mbx-pane","1"))},u=setInterval(()=>{let o=l(),r=o||s();if(!r)return;clearInterval(u);let i=r;for(;i.parentElement&&i.parentElement!==document.body&&!i.parentElement.querySelector(w);)i=i.parentElement;let g=r.getBoundingClientRect().left,b=g;for(let T of[i,...i.querySelectorAll("*")]){let p=T.getBoundingClientRect();p.width>60&&p.height>60&&p.left<b&&p.left>=g-60&&(b=p.left)}e=Math.round(b);let h=r;for(;h.parentElement&&h.parentElement!==document.body;)h=h.parentElement;h.setAttribute("data-mbx-root","1"),document.documentElement.style.setProperty("--mbx-gap",Math.max(0,Math.round(g-b))+"px"),o&&o.setAttribute("data-mbx-main","1"),a(),m({t:"pane",left:e})},400),d="";setInterval(()=>{let o=document.querySelector('[role="main"] h1, [role="main"] h2, [role="main"] [role="heading"], [data-mbx-main] h1, [data-mbx-main] h2'),r=(o&&o.textContent||"").trim();r&&r!==d&&r.length<80&&!E.test(r)&&(d=r,m({t:"title",title:r}))},1e3),window.addEventListener("message",o=>{if(o.origin!==f||o.source!==parent)return;let r=o.data;r&&r.__mbx===1&&r.t==="viewport"&&Number.isFinite(r.w)&&(n=Math.max(200,Math.round(r.w)),a())});let k=()=>/^\/messages\/(e2ee\/)?t\//.test(location.pathname),A=k();setInterval(()=>{let o=k();A&&!o&&m({t:"back"}),A=o},400)}if(c==="fn"){let t=()=>{for(let n of document.querySelectorAll('a, [role="button"]')){if(n.dataset.mbxBack)continue;let a=n.getBoundingClientRect();!a.width||a.top>100||a.left>100||a.width>64||a.height>64||n.querySelector("img")||(n.textContent||"").trim()||!n.querySelector("svg, i")||(n.dataset.mbxBack="1",n.style.setProperty("display","none","important"))}},e=!1;new MutationObserver(()=>{e||(e=!0,setTimeout(()=>{e=!1,t()},250))}).observe(document,{childList:!0,subtree:!0})}let I=/archiv|lưu trữ/i,L=/^(chats|đoạn chat)$/i;function _(){let t=Array.from(document.querySelectorAll('h1, h2, [role="heading"]')).find(n=>L.test((n.textContent||"").trim()));if(!t)return null;let e=t.parentElement;for(let n=0;n<5&&e;n++,e=e.parentElement){let a=Array.from(e.querySelectorAll('[role="button"][aria-label]')).filter(l=>!l.contains(t));if(a.length>=2)return a[0]}return null}async function M(){let t=Date.now()+2e4,e=0;for(;Date.now()<t;){let n=Array.from(document.querySelectorAll('[role="menuitem"], [role="menu"] [role="button"], [role="menu"] a')).find(l=>I.test(l.textContent||""));if(n)return n.click(),await x(600),!0;let a=_();a&&Date.now()-e>1500&&(e=Date.now(),a.click()),await x(400)}return!1}function D(){let t=document.querySelector('input[type="search"], [role="search"] input, input[aria-label*="earch" i], input[placeholder*="earch" i], input[placeholder*="\xECm ki\u1EBFm" i]');if(!t)return!1;t.scrollIntoView({block:"nearest"}),t.focus(),t.select?.();let e=t.closest("label")||t.parentElement;return e&&(e.classList.remove("mbx-flash"),e.offsetWidth,e.classList.add("mbx-flash")),!0}if(window.addEventListener("message",t=>{if(t.origin!==f||t.source!==parent)return;let e=t.data;!e||e.__mbx!==1||(e.t==="focus-search"&&D(),e.t==="action"&&e.name==="open-archived"&&M().finally(()=>m({t:"action-done"})))}),c==="list"){let t="",e=0,n=setInterval(()=>{let a=document.querySelector('[role="banner"]')||document,l=Array.from(a.querySelectorAll("image, img")).filter(d=>/fbcdn\.net|fbsbx\.com/.test(d.getAttribute("xlink:href")||d.getAttribute("href")||d.getAttribute("src")||"")),s=l[l.length-1],u=s&&(s.getAttribute("xlink:href")||s.getAttribute("href")||s.getAttribute("src"));u&&u!==t&&(t=u,m({t:"me",avatar:u})),++e>40&&clearInterval(n)},1500)}m({t:"hello"})})();})();
