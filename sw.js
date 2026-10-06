/* Service worker dos apps da Casa Vovó Chica de Aruanda.
   Ao publicar uma versão nova dos arquivos, aumente o número abaixo. */
const VERSAO = 'casa-vovo-chica-v6';
const ARQUIVOS = [
  './', './index.html', './filhos.html',
  './manifest-mae.webmanifest', './manifest-filhos.webmanifest',
  './icones/mae-192.png', './icones/mae-512.png', './icones/filhos-192.png', './icones/filhos-512.png'
];
const EXTERNOS = /^https:\/\/(www\.gstatic\.com\/firebasejs|fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com)\//;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const guardar = (req, res) => { if (res && (res.ok || res.type === 'opaque')) { const c = res.clone(); caches.open(VERSAO).then(x => x.put(req, c)); } return res; };
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    /* páginas: sempre tenta a versão mais nova; sem internet, abre a última salva */
    if (r.mode === 'navigate' || u.pathname.endsWith('.html')) {
      e.respondWith(fetch(r).then(res => guardar(r, res)).catch(() => caches.match(r, {ignoreSearch:true})));
      return;
    }
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => guardar(r, res))));
    return;
  }
  /* bibliotecas e fontes: usa a cópia salva */
  if (EXTERNOS.test(r.url)) e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => guardar(r, res))));
});
