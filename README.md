# 🛒 Lista de Compras PWA

Uma aplicação web leve, prática e responsiva para controle de listas de compras. Desenvolvida como um **Progressive Web App (PWA)**, ela foi desenhada para funcionar mesmo se o dispositivo estiver **totalmente offline** e ser instalável na tela inicial do celular ou desktop.

---

## 🚀 Funcionalidades

* **Cálculo de Valores Automático:** Soma de subtotais por produto e valor total da compra em tempo real à medida que os itens são adicionados.
* **Persistência de Dados Local:** Armazena os dados automaticamente no `LocalStorage` do navegador, impedindo a perda de informações ao fechar a aba ou recarregar a página.
* **Histórico de Listas (CRUD Completo):** Permite salvar a lista atual, recuperar listas antigas, renomeá-las para melhor organização ou excluir registros através de um painel de histórico (Modal).
* **Suporte Inteligente Offline:** Integração com Service Worker nativo para carregamento imediato e funcionamento sem conexão com a internet.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5 / CSS3 / JavaScript nativo (ES6+)**
* **Materialize CSS (v1.0.0):** Framework responsivo baseado no *Material Design* para estrutura de grids, modais e avisos em formato de Toasts.
* **Material Icons:** Biblioteca de ícones vetoriais fluidos.
* **Service Workers:** Estratégia de cacheamento *Cache-First* para resiliência de rede.

---

## 📁 Estrutura do Projeto

```text
├── index.html          # Interface do usuário (UI)
├── style.css           # Customizações visuais e regras de responsividade mobile
├── script.js           # Regras de cálculo, LocalStorage e registro do PWA
├── sw.js               # Service Worker (Gerenciador de cache e modo offline)
├── manifest.json       # Configurações do instalador PWA
└── icons/              # Ícones obrigatórios do aplicativo (192px e 512px)
