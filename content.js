(()=>{var u=`/*
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
`;(()=>{let c=new URL(chrome.runtime.getURL("/")).origin,d=Array.from(location.ancestorOrigins||[]);if(window===window.top||d[0]!==c)return;let r=(window.name||"").startsWith("mbx-")?window.name.slice(4):"fn",o=t=>parent.postMessage({__mbx:1,role:r,...t},c),m="mbx-style";function h(t){let e=document.documentElement;if(!e)return;let n=document.getElementById(m);t?(e.dataset.mbx=r,n||(n=document.createElement("style"),n.id=m,n.textContent=u,(document.head||e).appendChild(n))):(n?.remove(),delete e.dataset.mbx)}chrome.storage.local.get({compact:!0}).then(t=>h(t.compact)),chrome.storage.onChanged.addListener((t,e)=>{e==="local"&&t.compact&&h(!!t.compact.newValue)});let f=/^\/messages\/(e2ee\/)?t\/[A-Za-z0-9._-]+\/?$/;function g(t){let e=t.closest('[role="row"], [role="listitem"], li')||t;for(let n of e.querySelectorAll("span")){let a=n.textContent.trim();if(a&&a.length<80)return a}return(t.getAttribute("aria-label")||"").trim()}if(r!=="chat"&&document.addEventListener("click",t=>{if(t.button!==0||t.ctrlKey||t.metaKey||t.shiftKey||t.altKey)return;let e=t.target instanceof Element&&t.target.closest('a[href*="/messages/"]');if(!e)return;let n;try{n=new URL(e.href,location.href)}catch{return}n.origin!==location.origin||!f.test(n.pathname)||(t.preventDefault(),t.stopImmediatePropagation(),o({t:"thread",path:n.pathname,name:g(e)}))},!0),r==="chat"){let t=()=>/^\/messages\/(e2ee\/)?t\//.test(location.pathname),e=t();setInterval(()=>{let n=t();e&&!n&&o({t:"back"}),e=n},400)}function p(){let t=document.querySelector('input[type="search"], [role="search"] input, input[aria-label*="earch" i], input[placeholder*="earch" i], input[placeholder*="\xECm ki\u1EBFm" i]');if(!t)return!1;t.scrollIntoView({block:"nearest"}),t.focus(),t.select?.();let e=t.closest("label")||t.parentElement;return e&&(e.classList.remove("mbx-flash"),e.offsetWidth,e.classList.add("mbx-flash")),!0}if(window.addEventListener("message",t=>{if(t.origin!==c||t.source!==parent)return;let e=t.data;!e||e.__mbx!==1||e.t==="focus-search"&&p()}),r==="list"){let t="",e=0,n=setInterval(()=>{let a=document.querySelector('[role="banner"]')||document,b=Array.from(a.querySelectorAll("image, img")).filter(l=>/fbcdn\.net|fbsbx\.com/.test(l.getAttribute("xlink:href")||l.getAttribute("href")||l.getAttribute("src")||"")),i=b[b.length-1],s=i&&(i.getAttribute("xlink:href")||i.getAttribute("href")||i.getAttribute("src"));s&&s!==t&&(t=s,o({t:"me",avatar:s})),++e>40&&clearInterval(n)},1500)}o({t:"hello"})})();})();
