(()=>{var x=`/*
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
`;(()=>{let h=new URL(chrome.runtime.getURL("/")).origin,w=Array.from(location.ancestorOrigins||[]);if(window===window.top||w[0]!==h)return;let s=(window.name||"").startsWith("mbx-")?window.name.slice(4):"fn",m=t=>parent.postMessage({__mbx:1,role:s,...t},h),f=t=>new Promise(e=>setTimeout(e,t)),y='a[href*="/messages/t/"], a[href*="/messages/e2ee/t/"]',p="mbx-style";function b(t){let e=document.documentElement;if(!e)return;let n=document.getElementById(p);t?(e.dataset.mbx=s,n||(n=document.createElement("style"),n.id=p,n.textContent=x,(document.head||e).appendChild(n))):(n?.remove(),delete e.dataset.mbx)}chrome.storage.local.get({compact:!0}).then(t=>b(t.compact)),chrome.storage.onChanged.addListener((t,e)=>{e==="local"&&t.compact&&b(!!t.compact.newValue)});let v=/^\/messages\/(e2ee\/)?t\/[A-Za-z0-9._-]+\/?$/;function k(t){let e=t.closest('[role="row"], [role="listitem"], li')||t;for(let n of e.querySelectorAll("span")){let r=n.textContent.trim();if(r&&r.length<80)return r}return(t.getAttribute("aria-label")||"").trim()}if(s!=="chat"&&document.addEventListener("click",t=>{if(t.button!==0||t.ctrlKey||t.metaKey||t.shiftKey||t.altKey)return;let e=t.target instanceof Element&&t.target.closest('a[href*="/messages/"]');if(!e)return;let n;try{n=new URL(e.href,location.href)}catch{return}n.origin!==location.origin||!v.test(n.pathname)||(t.preventDefault(),t.stopImmediatePropagation(),m({t:"thread",path:n.pathname,name:k(e)}))},!0),s==="chat"){let l=function(){let o=document.querySelector('[role="main"]');if(o){let i=o.getBoundingClientRect();if(i.width>150&&i.left>=100)return o}let a=document.querySelector('[role="textbox"][contenteditable="true"]');if(a){let i=a;for(;i.parentElement&&i.parentElement!==document.body&&!i.parentElement.querySelector(y);)i=i.parentElement;let g=i.getBoundingClientRect();if(g.width>150&&g.left>=100)return i}return null},t=document.createElement("style");t.textContent="html[data-mbx-pane]{width:var(--mbx-w,100vw)!important;height:100%!important;overflow:hidden!important}html[data-mbx-pane] body{position:relative!important;width:var(--mbx-w,100vw)!important;height:100vh!important;margin:0!important;overflow:hidden!important;transform:translateZ(0)!important}html[data-mbx-pane] [data-mbx-root]{position:relative!important;left:calc(-1 * var(--mbx-l,0px))!important;width:calc(var(--mbx-l,0px) + var(--mbx-w,100vw))!important;min-width:0!important;max-width:none!important}",(document.head||document.documentElement).appendChild(t);let e=null,n=0,r=()=>{let o=document.documentElement;n&&o.style.setProperty("--mbx-w",n+"px"),e!=null&&(o.style.setProperty("--mbx-l",e+"px"),o.setAttribute("data-mbx-pane","1"))},u=setInterval(()=>{let o=l();if(!o)return;clearInterval(u);let a=o;for(;a.parentElement&&a.parentElement!==document.body;)a=a.parentElement;a.setAttribute("data-mbx-root","1"),e=Math.round(o.getBoundingClientRect().left),r(),m({t:"pane",left:e})},400);window.addEventListener("message",o=>{if(o.origin!==h||o.source!==parent)return;let a=o.data;a&&a.__mbx===1&&a.t==="viewport"&&Number.isFinite(a.w)&&(n=Math.max(200,Math.round(a.w)),r())});let c=()=>/^\/messages\/(e2ee\/)?t\//.test(location.pathname),d=c();setInterval(()=>{let o=c();d&&!o&&m({t:"back"}),d=o},400)}if(s==="fn"){let t=()=>{for(let n of document.querySelectorAll('a, [role="button"]')){if(n.dataset.mbxBack)continue;let r=n.getBoundingClientRect();!r.width||r.top>100||r.left>100||r.width>64||r.height>64||n.querySelector("img")||(n.textContent||"").trim()||!n.querySelector("svg, i")||(n.dataset.mbxBack="1",n.style.setProperty("display","none","important"))}},e=!1;new MutationObserver(()=>{e||(e=!0,setTimeout(()=>{e=!1,t()},250))}).observe(document,{childList:!0,subtree:!0})}let E=/archiv|lưu trữ/i,A=/^(chats|đoạn chat)$/i;function C(){let t=Array.from(document.querySelectorAll('h1, h2, [role="heading"]')).find(n=>A.test((n.textContent||"").trim()));if(!t)return null;let e=t.parentElement;for(let n=0;n<5&&e;n++,e=e.parentElement){let r=Array.from(e.querySelectorAll('[role="button"][aria-label]')).filter(l=>!l.contains(t));if(r.length>=2)return r[0]}return null}async function S(){let t=Date.now()+2e4,e=0;for(;Date.now()<t;){let n=Array.from(document.querySelectorAll('[role="menuitem"], [role="menu"] [role="button"], [role="menu"] a')).find(l=>E.test(l.textContent||""));if(n)return n.click(),await f(600),!0;let r=C();r&&Date.now()-e>1500&&(e=Date.now(),r.click()),await f(400)}return!1}function R(){let t=document.querySelector('input[type="search"], [role="search"] input, input[aria-label*="earch" i], input[placeholder*="earch" i], input[placeholder*="\xECm ki\u1EBFm" i]');if(!t)return!1;t.scrollIntoView({block:"nearest"}),t.focus(),t.select?.();let e=t.closest("label")||t.parentElement;return e&&(e.classList.remove("mbx-flash"),e.offsetWidth,e.classList.add("mbx-flash")),!0}if(window.addEventListener("message",t=>{if(t.origin!==h||t.source!==parent)return;let e=t.data;!e||e.__mbx!==1||(e.t==="focus-search"&&R(),e.t==="action"&&e.name==="open-archived"&&S().finally(()=>m({t:"action-done"})))}),s==="list"){let t="",e=0,n=setInterval(()=>{let r=document.querySelector('[role="banner"]')||document,l=Array.from(r.querySelectorAll("image, img")).filter(d=>/fbcdn\.net|fbsbx\.com/.test(d.getAttribute("xlink:href")||d.getAttribute("href")||d.getAttribute("src")||"")),u=l[l.length-1],c=u&&(u.getAttribute("xlink:href")||u.getAttribute("href")||u.getAttribute("src"));c&&c!==t&&(t=c,m({t:"me",avatar:c})),++e>40&&clearInterval(n)},1500)}m({t:"hello"})})();})();
