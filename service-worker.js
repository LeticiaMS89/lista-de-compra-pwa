const CACHE_NAME = 'lista-compras-v1';

// CORREÇÃO: Usar caminhos relativos (./) evita quebras ao hospedar o projeto em subpastas
const urlsToCache = [
  './',
  './index.html',
  './script.js',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
  // Adicione './style.css' aqui se você realmente criou esse arquivo de estilos customizados
];

// Instalação: Salva os arquivos essenciais no cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // console.log('Cache aberto com sucesso!');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptação de requisições: Busca no cache primeiro, se não achar vai para a internet
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se encontrou no cache, retorna o arquivo
        if (response) {
          return response;
        }

        // CORREÇÃO OTIMIZADA: Se for uma fonte externa (ex: Material Icons .woff2),
        // clona a resposta da internet e joga no cache dinamicamente para não quebrar offline
        return fetch(event.request).then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && !event.request.url.includes('fonts.gstatic.com')) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        }).catch(() => {
          // Tratamento de erro caso esteja sem internet e o arquivo não esteja no cache
        });
      })
  );
});