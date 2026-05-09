const API_URL = 'http://localhost:3000';


// ==========================================
// LISTAGEM DE CLIENTES
// ==========================================

async function carregarClientes() {

    const msgCarregando = document.getElementById('msgCarregando');
    const msgVazio      = document.getElementById('msgVazio');
    const tabelaWrapper = document.getElementById('tabelaWrapper');
    const corpoTabela   = document.getElementById('corpoTabela');
    const totalClientes = document.getElementById('totalClientes');

    // Reseta o estado visual antes de buscar
    msgCarregando.classList.remove('hidden');
    tabelaWrapper.classList.add('hidden');
    msgVazio.classList.add('hidden');

    try {
        const response = await fetch(`${API_URL}/clientes`);
        const data     = await response.json();

        msgCarregando.classList.add('hidden');

        if (data.total === 0) {
            msgVazio.classList.remove('hidden');
            totalClientes.textContent = '';
            return;
        }

        totalClientes.textContent = `${data.total} cliente(s)`;
        tabelaWrapper.classList.remove('hidden');

        corpoTabela.innerHTML = data.clientes
            .map(cliente => criarLinhaCliente(cliente))
            .join('');

    } catch (error) {
        msgCarregando.textContent = 'Erro ao conectar com o servidor.';
        msgCarregando.style.color = 'red';
        console.error('Erro ao carregar clientes:', error);
    }
}

/*
    Por que data attributes em vez de onclick="funcao(id, 'nome')"?

    Se o nome do cliente tiver aspas ou apóstrofos — ex: "D'Angelo" —
    o onclick quebraria o JavaScript. Data attributes não têm esse problema.
    Além disso, é mais fácil de ler e manter.

    Os dados ficam no <tr> e o event delegation (abaixo) os lê quando
    o botão é clicado.
*/
function criarLinhaCliente(cliente) {
    return `
        <tr
            id="linha-${cliente.id}"
            data-id="${cliente.id}"
            data-nome="${encodeURIComponent(cliente.nome)}"
            data-email="${encodeURIComponent(cliente.email)}"
            data-telefone="${encodeURIComponent(cliente.telefone)}"
        >
            <td>${cliente.nome}</td>
            <td>${cliente.email}</td>
            <td>${cliente.telefone}</td>
            <td>
                <div class="acoes">
                    <button class="btn-editar">Editar</button>
                    <button class="btn-excluir">Excluir</button>
                </div>
            </td>
        </tr>
    `;
}


// ==========================================
// EVENT DELEGATION — CLIQUES NA TABELA
// ==========================================

/*
    Event delegation: em vez de adicionar um listener em cada botão,
    adicionamos UM listener no elemento pai (tbody).

    Quando o usuário clica em qualquer botão dentro do tbody,
    o evento "borbulha" (bubble) até o tbody e tratamos aqui.

    Vantagem real: se a tabela for atualizada/recarregada,
    os listeners continuam funcionando — não precisamos
    re-registrá-los a cada renderização.
*/
function inicializarEventosDaTabela() {

    const corpoTabela = document.getElementById('corpoTabela');

    corpoTabela.addEventListener('click', (event) => {

        // event.target é o elemento exato que foi clicado (pode ser o botão ou um filho dele)
        // closest('button') sobe na árvore do DOM até encontrar um <button>
        const btn = event.target.closest('button');
        if (!btn) return; // Clique foi fora de um botão

        // Sobe até a <tr> para pegar os data attributes com os dados do cliente
        const linha    = btn.closest('tr');
        const id       = linha.dataset.id;
        const nome     = decodeURIComponent(linha.dataset.nome);
        const email    = decodeURIComponent(linha.dataset.email);
        const telefone = decodeURIComponent(linha.dataset.telefone);

        if (btn.classList.contains('btn-editar')) {
            abrirModal(id, nome, email, telefone);
        }

        if (btn.classList.contains('btn-excluir')) {
            confirmarExclusao(id, nome);
        }
    });
}


// ==========================================
// MODAL DE EDIÇÃO
// ==========================================

function abrirModal(id, nome, email, telefone) {

    // Pré-preenche o formulário com os dados atuais do cliente
    document.getElementById('editId').value       = id;
    document.getElementById('editNome').value     = nome;
    document.getElementById('editEmail').value    = email;
    document.getElementById('editTelefone').value = telefone;
    document.getElementById('msgModal').textContent = '';

    document.getElementById('modal').classList.remove('hidden');
}

function fecharModal() {
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('msgModal').textContent = '';
}

async function salvarEdicao() {

    const id       = document.getElementById('editId').value;
    const nome     = document.getElementById('editNome').value;
    const email    = document.getElementById('editEmail').value;
    const telefone = document.getElementById('editTelefone').value;
    const msgModal = document.getElementById('msgModal');

    // Validação básica no front antes de chamar a API
    if (!nome.trim() || !email.trim() || !telefone.trim()) {
        msgModal.textContent = 'Preencha todos os campos.';
        msgModal.style.color = 'orange';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/clientes/${parseInt(id)}`, {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                nome:     nome.trim(),
                email:    email.trim(),
                telefone: telefone.trim(),
            }),
        });

        const data = await response.json();

        if (response.ok) {
            fecharModal();
            await carregarClientes(); // Recarrega a tabela com os dados novos
        } else {
            msgModal.textContent = data.error;
            msgModal.style.color = 'red';
        }

    } catch (error) {
        msgModal.textContent = 'Erro ao conectar com o servidor.';
        msgModal.style.color = 'red';
        console.error('Erro ao editar cliente:', error);
    }
}


// ==========================================
// EXCLUSÃO DE CLIENTE
// ==========================================

async function confirmarExclusao(id, nome) {

    /*
        Usamos confirm() por agora — é simples e funciona.
        Na próxima iteração, vamos substituir por um modal de confirmação
        mais bonito, sem travar o navegador.
    */
    const confirmado = confirm(
        `Tem certeza que deseja excluir o cliente "${nome}"?\n\nAtenção: todos os serviços vinculados a ele serão removidos também.`
    );

    if (!confirmado) return;

    try {
        const response = await fetch(`${API_URL}/clientes/${id}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
            await carregarClientes(); // Atualiza a tabela após exclusão
        } else {
            alert(data.error || 'Erro ao excluir cliente.');
        }

    } catch (error) {
        alert('Erro ao conectar com o servidor.');
        console.error('Erro ao excluir cliente:', error);
    }
}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    carregarClientes();
    inicializarEventosDaTabela();

    // Botões do modal
    document.getElementById('btnSalvar').addEventListener('click', salvarEdicao);
    document.getElementById('btnCancelar').addEventListener('click', fecharModal);

    // Fechar o modal clicando no fundo escuro (overlay)
    // Só fecha se o clique foi exatamente no overlay, não na caixa branca
    document.getElementById('modal').addEventListener('click', function (event) {
        if (event.target === this) fecharModal();
    });
});