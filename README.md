# 🛒 Lista de Compras PWA

![Versão](https://img.shields.io/badge/version-1.1.0-blue.svg)
![PWA Ready](https://img.shields.io/badge/PWA-100%25%20Offline-success.svg)
![Licença](https://img.shields.io/badge/license-MIT-green.svg)
![Tecnologias](https://img.shields.io/badge/tech-HTML5%20%7C%20CSS3%20%7C%20JS%20ES6%2B%20%7C%20PWA-orange.svg)

Aplicativo web **Progressive Web App (PWA)** offline-first para gerenciamento e controle de listas de compras. Desenvolvido com foco em **Clean Code**, **Acessibilidade (A11y)**, **Design Responsivo**, **Desempenho** e **Segurança contra vulnerabilidades de código (XSS)**.

---

## 📋 Sumário

- [Visão Geral e Recursos](#-visão-geral-e-recursos)
- [Melhorias de Arquitetura e Segurança](#-melhorias-de-arquitetura-e-segurança)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Como Executar o Projeto](#-como-executar-o-projeto)
- [Recursos PWA e Suporte Offline](#-recursos-pwa-e-suporte-offline)
- [Licença](#-licença)

---

## 🚀 Visão Geral e Recursos

- 📝 **Gerenciamento de Produtos**: Adição de itens com nome, quantidade e valor unitário.
- ⌨️ **Envio via Teclado**: Suporte nativo ao envio de formulário pressionando a tecla `Enter`.
- 💰 **Cálculo Automático com Formatação BRL**: Cálculo do total de cada item e do valor acumulado formatado em Real (`R$`) via API nativa `Intl.NumberFormat`.
- 💾 **Persistência Local e Histórico**: Salva automaticamente a lista atual e permite criar, abrir, renomear e excluir listas no histórico (`localStorage`).
- 📱 **100% Responsivo e Adaptável**: Layout fluido com suporte a dispositivos móveis, tablets e desktop.
- 🌐 **Modo Offline e PWA**: Funciona sem conexão à internet através de Service Worker com cache estratégico de recursos estáticos e dinâmicos.
- 📲 **Instalável**: Suporte a ícones adaptativos (*maskable icons*) e atalhos rápidos (*app shortcuts*) para instalação direta no Android e iOS.

---

## 🛡️ Melhorias de Arquitetura e Segurança

| Recurso / Desafio | Implementação / Solução | Benefício |
| :--- | :--- | :--- |
| **Proteção contra XSS** | Função utilitária `escaparHTML()` aplicada em todas as entradas de dados do usuário. | Previne a injecção e execução de scripts maliciosos no navegador. |
| **Formatação de Moeda** | Utilização da API nativa `Intl.NumberFormat('pt-BR')`. | Formatação precisa no padrão BRL, substituindo manipulação manual de strings. |
| **Performance do DOM** | Delegação de eventos (`addEventListener` no contêiner pai) e uso de `DocumentFragment`. | Evita poluição de escopo global com eventos inline (`onclick`) e reduz ciclos de reflow/repaint. |
| **Gestão de Memória** | Destruição e limpeza de instâncias obsoletas do Materialize CSS (modais e tooltips). | Previne vazamento de memória durante interações repetidas. |
| **Tratamento de Exceções** | Envoltório `try/catch` nas chamadas ao `localStorage`. | Garante que o app continue funcionando mesmo em navegação privada ou armazenamento cheio. |
| **Ciclo de Vida do SW** | Adição dos eventos `skipWaiting` e `clients.claim` com limpeza automática de caches antigos no evento `activate`. | Garante atualização instantânea da aplicação quando uma nova versão do Service Worker for implantada. |

---

## 📁 Estrutura do Projeto

lista-de-compras-pwa/

│

├── index.html        # Markup HTML5 semântico, acessível e estruturado

├── style.css         # Estilização modular com CSS Variables e Design Tokens

├── script.js         # Lógica de negócios ES6+, sanitização XSS e delegação de eventos

├── sw.js             # Service Worker para estratégia de cache e suporte offline

├── manifest.json     # Manifesto do PWA com ícones adaptativos e atalhos

└── icons/            # Ícones do aplicativo em diferentes resoluções (192px, 512px)

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 Semântico**: Estruturação limpa com tags `<header>`, `<main>`, `<section>`, `<form>` e atributos ARIA para acessibilidade.
- **CSS3 Moderno**: Utilização de Variáveis CSS (`:root`), Flexbox, Media Queries e integração com a biblioteca [Materialize CSS](https://materializecss.com/).
- **JavaScript (ES6+)**: Código modular, seguro contra XSS, com delegação de eventos e manipulação otimizada do DOM.
- **Service Worker API**: Estratégia de cache offline para carregamento instantâneo.
- **Web App Manifest**: Configuração PWA para instalação como aplicativo nativo.

---

## ⚙️ Como Executar o Projeto

Como a aplicação é desenvolvida em tecnologias nativas da Web (*Vanilla JS*), ela não exige a instalação de pacotes via `npm` ou `yarn`.

**Clone o repositório**:
   ```bash
   git clone (https://github.com/LeticiaMS89/lista-de-compra-pwa.git)
   ```

1. Acesse a pasta do projeto:
```bash
cd lista-de-compras-pwa
```

2. Abra o projeto no navegador:

Para testar todos os recursos de PWA e Service Worker, é recomendado rodar um servidor local simples, como a extensão Live Server no VS Code ou o comando Python:
```bash
python -m http.server 8000
```

Acesse http://localhost:8000 no seu navegador.

## 📱 Recursos PWA e Suporte Offline
Suporte a Instalação (Android / Desktop)
O arquivo manifest.json está configurado com as diretrizes da W3C, incluindo:

Ícones padrão e adaptativos (maskable icons).

Tema visual sincronizado (#2196f3).

Atalho rápido para acessar as Listas Salvas direto do ícone na tela inicial.

Suporte ao iOS Safari
O documento index.html inclui as meta tags proprietárias da Apple:
```bash
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Compras">
<link rel="apple-touch-icon" href="icons/icon-192.png">
```

## 📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

