/**
 * ===================================================================
 * LISTA DE COMPRAS PWA - LÓGICA PRINCIPAL (ES6+)
 * ===================================================================
 * 
 * Melhores práticas aplicadas:
 * - Sanitização contra XSS (Cross-Site Scripting)
 * - Formatação monetária nativa com Intl.NumberFormat
 * - Delegação de Eventos para maior performance e desacoplamento do HTML
 * - Tratamento de exceções com try/catch no LocalStorage
 * - Gerenciamento limpo de instâncias do Materialize CSS (Modais e Tooltips)
 */

// ===================================================================
// 1. ESTADO DA APLICAÇÃO & INICIALIZAÇÃO
// ===================================================================

// Array de produtos da lista atual carregado de forma segura do LocalStorage
let produtos = carregarDoStorage('listaAtual', []);

/**
 * Evento executado assim que a estrutura do DOM estiver totalmente carregada
 */
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa os Modais do Materialize CSS
  const elementosModal = document.querySelectorAll('.modal');
  M.Modal.init(elementosModal);

  // Associa os listeners de eventos aos botões e formulários
  configurarEventos();

  // Renderiza a lista de produtos e o histórico de listas salvas
  renderizarLista();
  carregarListasSalvas();
});

// ===================================================================
// 2. FUNÇÕES UTILITÁRIAS & SEGURANÇA
// ===================================================================

/**
 * SEGURANÇA CONTRA XSS: Converte caracteres especiais em entidades HTML seguras
 * @param {string} str - Texto inserido pelo usuário
 * @returns {string} Texto sanitizado
 */
function escaparHTML(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * FORMATADOR DE MOEDA (R$ BRL)
 * Utiliza a API nativa do navegador para formatação monetária precisa
 * @param {number} valor - Valor numérico a ser formatado
 * @returns {string} Valor formatado (ex: "R$ 12,50")
 */
function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor || 0);
}

/**
 * PERSISTÊNCIA SEGURA: Lê dados do LocalStorage com tratamento de erros
 */
function carregarDoStorage(chave, valorPadrao) {
  try {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : valorPadrao;
  } catch (erro) {
    console.error(`Erro ao ler '${chave}' do LocalStorage:`, erro);
    return valorPadrao;
  }
}

/**
 * PERSISTÊNCIA SEGURA: Grava dados no LocalStorage com tratamento de erros
 */
function salvarNoStorage(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (erro) {
    console.error(`Erro ao salvar '${chave}' no LocalStorage:`, erro);
    M.toast({ html: 'Atenção: Não foi possível salvar (Armazenamento cheio ou privado).' });
  }
}

// ===================================================================
// 3. VINCULAÇÃO DE EVENTOS (EVENT LISTENERS)
// ===================================================================

/**
 * Centraliza a escuta de todos os botões e formulários do HTML refatorado
 */
function configurarEventos() {
  // Formulário de adição de produto
  const formProduto = document.getElementById('formProduto');
  if (formProduto) {
    formProduto.addEventListener('submit', adicionarProduto);
  }

  // Botões de Ação na Tela Principal
  document.getElementById('btnSalvarLista')?.addEventListener('click', salvarLista);
  document.getElementById('btnLimparAtual')?.addEventListener('click', limparLista);
  document.getElementById('btnApagarHistorico')?.addEventListener('click', apagarTodoOHistorico);

  // Botão dentro do Modal de Listas Salvas
  document.getElementById('btnApagarTodasSalvas')?.addEventListener('click', apagarTodasAsListasSalvas);

  // DELEGAÇÃO DE EVENTOS: Escuta cliques na tabela de produtos (Exclusão por item)
  const listaProdutosTable = document.getElementById('listaProdutos');
  if (listaProdutosTable) {
    listaProdutosTable.addEventListener('click', (e) => {
      const botaoExcluir = e.target.closest('.btn-deletar-item');
      if (botaoExcluir) {
        const id = Number(botaoExcluir.dataset.id);
        removerProduto(id);
      }
    });
  }

  // DELEGAÇÃO DE EVENTOS: Escuta cliques nas ações do modal de listas salvas
  const containerListasSalvas = document.getElementById('listasSalvas');
  if (containerListasSalvas) {
    containerListasSalvas.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-acao]');
      if (!btn) return;

      const acao = btn.dataset.acao;
      const id = Number(btn.dataset.id);

      if (acao === 'abrir') abrirLista(id);
      if (acao === 'renomear') renomearLista(id);
      if (acao === 'apagar') apagarListaSalva(id);
    });
  }
}

// ===================================================================
// 4. LÓGICA DE PRODUTOS (TELA PRINCIPAL)
// ===================================================================

/**
 * Adiciona um novo produto à lista a partir do envio do formulário
 */
function adicionarProduto(evento) {
  evento.preventDefault(); // Impede o recarregamento da página

  const inputNome = document.getElementById('nomeProduto');
  const inputQtd = document.getElementById('qtdProduto');
  const inputValor = document.getElementById('valorProduto');

  const nome = inputNome.value.trim();
  const qtd = parseInt(inputQtd.value, 10);
  const valor = parseFloat(inputValor.value);

  // Validação estrita dos campos
  if (!nome || isNaN(qtd) || qtd <= 0 || isNaN(valor) || valor < 0) {
    M.toast({ html: 'Preencha todos os campos corretamente!' });
    return;
  }

  // Criação do objeto produto
  const novoProduto = {
    id: Date.now(),
    nome: nome,
    qtd: qtd,
    valor: valor
  };

  produtos.push(novoProduto);
  salvarNoStorage('listaAtual', produtos);
  renderizarLista();

  // Reseta o formulário e retorna o foco para o primeiro campo
  evento.target.reset();
  document.getElementById('qtdProduto').value = '1'; // Valor padrão
  inputNome.focus();

  M.toast({ html: 'Produto adicionado com sucesso!' });
}

/**
 * Renderiza a tabela de produtos e calcula o valor total acumulado
 */
function renderizarLista() {
  const listaElementos = document.getElementById('listaProdutos');
  const totalCompraElemento = document.getElementById('totalCompra');

  if (!listaElementos || !totalCompraElemento) return;

  listaElementos.innerHTML = '';
  let totalGeral = 0;

  // Estado Vazio (UX)
  if (produtos.length === 0) {
    listaElementos.innerHTML = `
      <tr>
        <td colspan="5" class="center-align grey-text text-darken-1">
          Nenhum produto adicionado na lista atual.
        </td>
      </tr>
    `;
    totalCompraElemento.innerText = formatarMoeda(0);
    return;
  }

  // Fragmento DOM para otimização da performance de renderização
  const fragmento = document.createDocumentFragment();

  produtos.forEach(item => {
    const totalItem = item.qtd * item.valor;
    totalGeral += totalItem;

    const tr = document.createElement('tr');
    
    // Injeção segura de dados usando sanitização XSS
    tr.innerHTML = `
      <td>${escaparHTML(item.nome)}</td>
      <td>${item.qtd}</td>
      <td>${formatarMoeda(item.valor)}</td>
      <td><strong>${formatarMoeda(totalItem)}</strong></td>
      <td class="center-align">
        <button type="button" 
                class="btn-floating btn-small red waves-effect btn-deletar-item" 
                data-id="${item.id}" 
                aria-label="Remover Produto">
          <i class="material-icons">delete</i>
        </button>
      </td>
    `;
    fragmento.appendChild(tr);
  });

  listaElementos.appendChild(fragmento);
  totalCompraElemento.innerText = formatarMoeda(totalGeral);
}

/**
 * Remove um único produto da lista pelo seu ID
 */
function removerProduto(id) {
  const produtoEncontrado = produtos.find(item => item.id === id);
  const nomeProduto = produtoEncontrado ? produtoEncontrado.nome : 'este produto';

  if (!confirm(`Deseja realmente remover "${nomeProduto}" da sua lista?`)) return;

  produtos = produtos.filter(item => item.id !== id);
  salvarNoStorage('listaAtual', produtos);
  renderizarLista();

  M.toast({ html: `"${escaparHTML(nomeProduto)}" foi removido!` });
}

/**
 * Esvazia a lista de compras atual da tela
 */
function limparLista() {
  if (produtos.length === 0) {
    M.toast({ html: 'A lista atual já está vazia.' });
    return;
  }

  if (confirm('Tem certeza que deseja esvaziar a lista atual?')) {
    produtos = [];
    salvarNoStorage('listaAtual', produtos);
    renderizarLista();
    M.toast({ html: 'Lista atual esvaziada!' });
  }
}

// ===================================================================
// 5. LÓGICA DO HISTÓRICO (LISTAS SALVAS & MODAL)
// ===================================================================

/**
 * Salva a lista atual no histórico de listas do usuário
 */
function salvarLista() {
  if (produtos.length === 0) {
    M.toast({ html: 'Não é possível salvar uma lista vazia!' });
    return;
  }

  const listasSalvas = carregarDoStorage('listasSalvas', []);
  const inputNomeLista = document.getElementById('nomeListaSalvar');

  const dataAtual = new Date().toLocaleString('pt-BR');
  const nomeDigitado = inputNomeLista ? inputNomeLista.value.trim() : '';
  const nomeDefinido = nomeDigitado || `Lista de ${dataAtual.split(' ')[0]}`;

  const novaLista = {
    id: Date.now(),
    nome: nomeDefinido,
    data: dataAtual,
    produtos: [...produtos] // Copia profunda do array
  };

  listasSalvas.push(novaLista);
  salvarNoStorage('listasSalvas', listasSalvas);

  if (inputNomeLista) inputNomeLista.value = '';
  
  carregarListasSalvas();
  M.toast({ html: `Lista "${escaparHTML(nomeDefinido)}" salva com sucesso!` });
}

/**
 * Renderiza o histórico de listas salvas dentro do Modal
 */
function carregarListasSalvas() {
  const listasSalvas = carregarDoStorage('listasSalvas', []);
  const listaElemento = document.getElementById('listasSalvas');

  if (!listaElemento) return;

  // Destrói instâncias antigas de tooltips para prevenir vazamento de memória
  const tooltipsAntigos = document.querySelectorAll('.tooltipped');
  tooltipsAntigos.forEach(el => {
    const instancia = M.Tooltip.getInstance(el);
    if (instancia) instancia.destroy();
  });

  listaElemento.innerHTML = '';

  if (listasSalvas.length === 0) {
    listaElemento.innerHTML = `
      <li class="collection-item center-align grey-text">
        Nenhuma lista salva no histórico.
      </li>
    `;
    return;
  }

  const fragmento = document.createDocumentFragment();

  listasSalvas.forEach(lista => {
    const item = document.createElement('li');
    item.className = 'collection-item';
    
    // Injeção segura utilizando data-attributes e sanitização XSS
    item.innerHTML = `
      <div>
        <span class="title-lista-salva" style="font-size: 1.1rem; font-weight: bold; color: #1565c0;">
          ${escaparHTML(lista.nome)}
        </span>
        <br>
        <small class="grey-text">
          Salva em: ${lista.data} (${lista.produtos.length} itens)
        </small>
      </div>

      <div class="botoes-lista">
        <button type="button" 
                class="btn-small blue tooltipped" 
                data-position="top" 
                data-tooltip="Abrir Lista" 
                data-acao="abrir" 
                data-id="${lista.id}"
                aria-label="Abrir Lista">
          <i class="material-icons">folder_open</i>
        </button>

        <button type="button" 
                class="btn-small orange darken-1 tooltipped" 
                data-position="top" 
                data-tooltip="Renomear" 
                data-acao="renomear" 
                data-id="${lista.id}"
                aria-label="Renomear Lista">
          <i class="material-icons">edit</i>
        </button>

        <button type="button" 
                class="btn-small red tooltipped" 
                data-position="top" 
                data-tooltip="Apagar" 
                data-acao="apagar" 
                data-id="${lista.id}"
                aria-label="Apagar Lista">
          <i class="material-icons">delete</i>
        </button>
      </div>
    `;
    fragmento.appendChild(item);
  });

  listaElemento.appendChild(fragmento);

  // Re-inicializa os tooltips do Materialize CSS nos novos botões
  const novosTooltips = document.querySelectorAll('.tooltipped');
  M.Tooltip.init(novosTooltips);
}

/**
 * Carrega uma lista salva do histórico para a tela principal
 */
function abrirLista(id) {
  const listasSalvas = carregarDoStorage('listasSalvas', []);
  const lista = listasSalvas.find(item => item.id === id);

  if (!lista) return;

  produtos = [...lista.produtos];
  salvarNoStorage('listaAtual', produtos);
  renderizarLista();

  // Fecha o modal de listas salvas
  const modalElemento = document.getElementById('modalListas');
  if (modalElemento) {
    const instanciaModal = M.Modal.getInstance(modalElemento);
    if (instanciaModal) instanciaModal.close();
  }

  M.toast({ html: 'Lista carregada na tela com sucesso!' });
}

/**
 * Renomeia uma lista no histórico
 */
function renomearLista(id) {
  const listasSalvas = carregarDoStorage('listasSalvas', []);
  const lista = listasSalvas.find(item => item.id === id);

  if (!lista) return;

  const novoNome = prompt(`Digite o novo nome para a lista "${lista.nome}":`, lista.nome);

  if (novoNome === null) return; // Usuário cancelou
  
  if (novoNome.trim() === '') {
    M.toast({ html: 'O nome da lista não pode ficar em branco!' });
    return;
  }

  lista.nome = novoNome.trim();
  salvarNoStorage('listasSalvas', listasSalvas);
  carregarListasSalvas();

  M.toast({ html: `Lista renomeada para "${escaparHTML(lista.nome)}"!` });
}

/**
 * Remove uma única lista do histórico salvas
 */
function apagarListaSalva(id) {
  const listasSalvas = carregarDoStorage('listasSalvas', []);
  const listaEncontrada = listasSalvas.find(l => l.id === id);
  const nomeLista = listaEncontrada ? listaEncontrada.nome : 'esta lista';

  if (!confirm(`Tem certeza que deseja apagar a lista "${nomeLista}" do histórico?`)) return;

  const listasAtualizadas = listasSalvas.filter(l => l.id !== id);
  salvarNoStorage('listasSalvas', listasAtualizadas);

  carregarListasSalvas();
  M.toast({ html: 'Lista removida do histórico!' });
}

/**
 * Apaga todas as listas do histórico salvas
 */
function apagarTodasAsListasSalvas() {
  const listasSalvas = carregarDoStorage('listasSalvas', []);

  if (listasSalvas.length === 0) {
    M.toast({ html: 'O histórico já está vazio!' });
    return;
  }

  if (confirm('Deseja apagar TODAS as listas salvas do histórico? (A lista atual da tela não será afetada)')) {
    localStorage.removeItem('listasSalvas');
    carregarListasSalvas();
    M.toast({ html: 'Histórico de listas apagado com sucesso!' });
  }
}

/**
 * Limpa todo o sistema (Lista atual + Histórico)
 */
function apagarTodoOHistorico() {
  if (confirm('Atenção: Isso irá apagar a lista atual E todo o histórico salvo. Deseja continuar?')) {
    localStorage.clear();
    produtos = [];
    renderizarLista();
    carregarListasSalvas();
    M.toast({ html: 'Todos os dados do sistema foram limpos!' });
  }
}

// ===================================================================
// 6. REGISTRO DO SERVICE WORKER (PWA)
// ===================================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then(() => console.log('Service Worker PWA registrado com sucesso!'))
      .catch((err) => console.error('Falha ao registrar o Service Worker:', err));
  });
}
