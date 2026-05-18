// --- Variáveis Globais ---
let produtos = JSON.parse(localStorage.getItem("listaAtual")) || [];

// --- Inicialização Automática ao Carregar a Página ---
document.addEventListener('DOMContentLoaded', function() {
    const modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);
    
    renderizarLista();
    carregarListasSalvas();
});
// --- Lógica de Produtos (Tela Principal) ---

function adicionarProduto() {
    const inputNome = document.getElementById("nomeProduto");
    const inputQtd = document.getElementById("qtdProduto");
    const inputValor = document.getElementById("valorProduto");

    if (!inputNome.value.trim() || !inputValor.value || inputQtd.value <= 0) {
        M.toast({ html: 'Preencha todos os campos corretamente!' });
        return;
    }

    const novo = {
        id: Date.now(),
        nome: inputNome.value.trim(),
        qtd: parseInt(inputQtd.value),
        valor: parseFloat(inputValor.value)
    };

    produtos.push(novo);
    salvarListaAtual();
    renderizarLista();

    // Limpa o formulário
    inputNome.value = "";
    inputQtd.value = "1";
    inputValor.value = "";
    inputNome.focus();

    M.toast({ html: 'Produto adicionado!' });
}

function renderizarLista() {
    const listaElementos = document.getElementById("listaProdutos");
    const totalCompra = document.getElementById("totalCompra");
    
    listaElementos.innerHTML = ""; 
    let totalGeral = 0;

    if (produtos.length === 0) {
        listaElementos.innerHTML = `<tr><td colspan="5" class="center-align" style="color: #64748b;">Nenhum produto na lista.</td></tr>`;
        totalCompra.innerText = "R$ 0,00";
        return;
    }

    produtos.forEach(item => {
        const totalItem = item.qtd * item.valor;
        totalGeral += totalItem;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.nome}</td>
            <td>${item.qtd}</td>
            <td>R$ ${item.valor.toFixed(2).replace('.', ',')}</td>
            <td><strong>R$ ${totalItem.toFixed(2).replace('.', ',')}</strong></td>
            <td>
                <button class="btn-floating btn-small red waves-effect" onclick="removerProduto(${item.id})">
                    <i class="material-icons">delete</i>
                </button>
            </td>
        `;
        listaElementos.appendChild(tr);
    });

    totalCompra.innerText = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
}

// --- FUNÇÃO ATUALIZADA: Confirmação antes de apagar um produto ---
function removerProduto(id) {
    // 1. Localiza o produto no array para descobrir o nome dele
    const produtoEncontrado = produtos.find(item => item.id === id);
    const nomeProduto = produtoEncontrado ? produtoEncontrado.nome : "este produto";

    // 2. Abre a janelinha de confirmação (Sim = OK, Não = Cancelar)
    const confirmar = confirm(`Deseja realmente remover "${nomeProduto}" da sua lista?`);
    
    // 3. Se o usuário clicar em "Cancelar" (Não), a função para aqui e não apaga
    if (!confirmar) return;

    // 4. Se clicou em "OK" (Sim), remove o produto normalmente
    produtos = produtos.filter(item => item.id !== id);
    salvarListaAtual();
    renderizarLista();
    
    M.toast({ html: `"${nomeProduto}" foi removido!` });
}
function salvarListaAtual() {
    localStorage.setItem("listaAtual", JSON.stringify(produtos));
}

function limparLista() {
    produtos = [];
    salvarListaAtual();
    renderizarLista();
    M.toast({ html: 'Lista atual esvaziada!' });
}

// --- Lógica do Histórico (Modal de Listas Salvas) ---

function salvarLista() {
    if (produtos.length === 0) {
        M.toast({ html: 'Não é possível salvar uma lista vazia!' });
        return;
    }

    const listasSalvas = JSON.parse(localStorage.getItem("listasSalvas")) || [];
    const inputNomeLista = document.getElementById("nomeListaSalvar");
    
    const dataAtual = new Date().toLocaleString('pt-BR');
    const nomeDefinido = inputNomeLista.value.trim() || `Lista de ${dataAtual.split(' ')[0]}`;

    const novaLista = {
        id: Date.now(),
        nome: nomeDefinido,
        data: dataAtual,
        produtos: [...produtos] 
    };

    listasSalvas.push(novaLista);
    localStorage.setItem("listasSalvas", JSON.stringify(listasSalvas));
    
    inputNomeLista.value = "";
    carregarListasSalvas();
    M.toast({ html: `Lista "${nomeDefinido}" salva com sucesso!` });
}

function carregarListasSalvas() {
    const listasSalvas = JSON.parse(localStorage.getItem("listasSalvas")) || [];
    const listaElemento = document.getElementById("listasSalvas");
    listaElemento.innerHTML = "";

    if (listasSalvas.length === 0) {
        listaElemento.innerHTML = `<li class="collection-item">Nenhuma lista salva no histórico.</li>`;
        return;
    }

    listasSalvas.forEach(lista => {
        const item = document.createElement("li");
        item.className = "collection-item";
        item.innerHTML = `
            <div>
                <span style="font-size: 1.1rem; font-weight: bold; color: #2b5cff;">${lista.nome}</span>
                <br>
                <small style="color: #64748b;">Salva em: ${lista.data} (${lista.produtos.length} itens)</small>
            </div>
            <div class="botoes-lista" style="display: flex; gap: 5px;">
                <button class="btn-small blue tooltipped" data-position="top" data-tooltip="Abrir Lista" onclick="abrirLista(${lista.id})">
                    <i class="material-icons">folder_open</i>
                </button>
                <button class="btn-small orange darken-1 tooltipped" data-position="top" data-tooltip="Renomear" onclick="renomearLista(${lista.id})">
                    <i class="material-icons">edit</i>
                </button>
                <button class="btn-small red tooltipped" data-position="top" data-tooltip="Apagar" onclick="apagarListaSalva(${lista.id})">
                    <i class="material-icons">delete</i>
                </button>
            </div>
        `;
        listaElemento.appendChild(item);
    });

    const tooltips = document.querySelectorAll('.tooltipped');
    M.Tooltip.init(tooltips);
}

function abrirLista(id) {
    const listasSalvas = JSON.parse(localStorage.getItem("listasSalvas")) || [];
    const lista = listasSalvas.find(item => item.id === id);

    if (!lista) return;

    produtos = [...lista.produtos];
    salvarListaAtual();
    renderizarLista();

    const modal = M.Modal.getInstance(document.getElementById('modalListas'));
    if (modal) modal.close();

    M.toast({ html: 'Lista carregada com sucesso!' });
}

function renomearLista(id) {
    let listasSalvas = JSON.parse(localStorage.getItem("listasSalvas")) || [];
    const lista = listasSalvas.find(item => item.id === id);
    
    if (!lista) return;

    const novoNome = prompt(`Digite o novo nome para a lista "${lista.nome}":`, lista.nome);

    if (novoNome === null) return; 
    if (novoNome.trim() === "") {
        M.toast({ html: 'O nome da lista não pode ficar em branco!' });
        return;
    }

    lista.nome = novoNome.trim();
    localStorage.setItem("listasSalvas", JSON.stringify(listasSalvas));
    carregarListasSalvas();
    M.toast({ html: `Lista renomeada para "${novoNome}"!` });
}

// --- FUNÇÃO ATUALIZADA: Confirmação antes de apagar uma lista do histórico ---
function apagarListaSalva(id) {
    const listasSalvas = JSON.parse(localStorage.getItem("listasSalvas")) || [];
    const listaEncontrada = listasSalvas.find(lista => lista.id === id);
    const nomeLista = listaEncontrada ? listaEncontrada.nome : "esta lista";

    // Janela de confirmação antes de deletar o backup do histórico
    const confirmar = confirm(`Tem certeza que deseja apagar permanentemente o histórico da lista "${nomeLista}"?`);
    
    if (!confirmar) return;

    // Executa a remoção se confirmado
    const listasAtualizadas = listasSalvas.filter(lista => lista.id !== id);
    localStorage.setItem("listasSalvas", JSON.stringify(listasAtualizadas));
    
    carregarListasSalvas();
    M.toast({ html: 'Lista removida do histórico!' });
}
function apagarTodasAsListasSalvas() {
    const listasSalvas = JSON.parse(localStorage.getItem("listasSalvas")) || [];
    if (listasSalvas.length === 0) {
        M.toast({ html: 'O histórico já está vazio!' });
        return;
    }

    if (confirm("Deseja apagar TODAS as listas do histórico? A lista da tela continuará salva.")) {
        localStorage.removeItem("listasSalvas");
        carregarListasSalvas();
        M.toast({ html: 'Histórico de listas apagado!' });
    }
}

function apagarTodoOHistorico() {
    if (confirm("Tem certeza que deseja resetar TUDO? Isso apagará a lista atual e todo o histórico permanentemente.")) {
        produtos = [];
        salvarListaAtual();
        renderizarLista();
        localStorage.removeItem("listasSalvas");
        carregarListasSalvas();
        M.toast({ html: 'Todo o sistema foi reiniciado!' });
    }
}

// --- Registro do Service Worker (PWA) ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker ativo!'))
      .catch(err => console.error('Erro no Service Worker:', err));
  });
}

// --- LÓGICA DE MODO ESCURO ---

function alternarModoEscuro() {
    const body = document.body;
    const checkbox = document.getElementById("toggleDarkMode");

    // Se o checkbox foi marcado, liga o Dark Mode
    if (checkbox.checked) {
        body.classList.add("dark-mode");
        localStorage.setItem("modoEscuro", "ativo");
        M.toast({ html: 'Modo Escuro ativado!' });
    } else {
        body.classList.remove("dark-mode");
        localStorage.setItem("modoEscuro", "inativo");
        M.toast({ html: 'Modo Claro ativado!' });
    }
}

function verificarTemaSalvo() {
    const RichmondTema = localStorage.getItem("modoEscuro");
    const checkbox = document.getElementById("toggleDarkMode");

    if (RichmondTema === "ativo") {
        document.body.classList.add("dark-mode");
        if (checkbox) checkbox.checked = true; // Garante que o botão inicia "deslizado" para a direita
    } else {
        document.body.classList.remove("dark-mode");
        if (checkbox) checkbox.checked = false;
    }
}