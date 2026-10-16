/**
 * ===================================================================
 * LISTA DE COMPRAS PWA - SERVICE WORKER (SW.JS)
 * ===================================================================
 * 
 * Este arquivo transforma a aplicação web em um Progressive Web App (PWA)
 * permitindo funcionamento 100% offline, carregamento instantâneo
 * e gerenciamento de cache resiliente.
 */

// Nome único da versão do cache. Mude para 'v2', 'v3' quando atualizar a aplicação.
const CACHE_NAME = 'lista-compras-v1.1';

// Lista de arquivos vitais que devem ser salvos no cache assim que o app for instalado
const RECURSOS_ESTATICOS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  // CDNs de Terceiros (CSS, JS e Ícones do Materialize)
  'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js',
  'https://fonts.googleapis.com/icon?family=Material-Icons'
];

// ===================================================================
// 1. EVENTO DE INSTALAÇÃO (INSTALL)
// ===================================================================
self.addEventListener('install', (evento) => {
  // Força o Service Worker recém-instalado a se tornar ativo imediatamente
  self.skipWaiting();

  evento.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pré-carregando shell do aplicativo...');
      return cache.addAll(RECURSOS_ESTATICOS);
    }).catch((erro) => {
      console.error('[Service Worker] Falha ao pré-carregar recursos estáticos:', erro);
    })
  );
});

// ===================================================================
// 2. EVENTO DE ATIVAÇÃO (ACTIVATE) - LIMPEZA DE CACHE ANTIGO
// ===================================================================
self.addEventListener('activate', (evento) => {
  // Permite que o Service Worker assuma o controle da página imediatamente
  evento.waitUntil(
    caches.keys().then((chavesCache) => {
      return Promise.all(
        chavesCache.map((chave) => {
          // Se a chave do cache for antiga e diferente do CACHE_NAME atual, apaga
          if (chave !== CACHE_NAME) {
            console.log('[Service Worker] Removendo cache antigo:', chave);
            return caches.delete(chave);
          }
        })
      );
    }).then(() => self.clients.claim()) // Assume o controle das abas abertas
  );
});

// ===================================================================
// 3. INTERCEPTAÇÃO DE REQUISIÇÕES (FETCH)
// Estratégia: Cache First com Dynamic Fallback (Cache Primeiro)
// ===================================================================
self.addEventListener('fetch', (evento) => {
  // Ignora requisições que não utilizem o método GET (ex: POST, PUT, DELETE)
  if (evento.request.method !== 'GET') return;

  evento.respondWith(
    caches.match(evento.request).then((respostaCache) => {
      // 1. Se o arquivo já está no cache, retorna imediatamente (Acesso offline rápido)
      if (respostaCache) {
        return respostaCache;
      }

      // 2. Se não está no cache, busca na rede
      return fetch(evento.request).then((respostaRede) => {
        // Valida se a resposta da rede é válida
        // Nota: Respostas 'opaque' (status 0) de CDNs externos (ex: Google Fonts) também devem ser mantidas
        const ehStatusValido = respostaRede.status === 200 || respostaRede.type === 'opaque';
        
        if (!respostaRede || !ehStatusValido) {
          return respostaRede;
        }

        // Clona a resposta (pois a stream de resposta só pode ser consumida uma vez)
        const respostaParaCache = respostaRede.clone();

        // Salva dinamicamente o novo recurso no cache para futuros acessos offline
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(evento.request, respostaParaCache);
        });

        return respostaRede;
      }).catch((erro) => {
        console.warn('[Service Worker] Requisição falhou e não estava no cache:', evento.request.url);
        // Em caso de erro e falta de conexão, você pode retornar uma página offline fallback aqui se desejar
      });
    })
  );
});
