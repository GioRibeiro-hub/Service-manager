// Endereço base da API
const API_URL = 'http://localhost:3000';

// Configuração dos status: valor interno → label e classe CSS
// Centralizar aqui evita repetir essa lógica em vários lugares do código
const STATUS_CONFIG = {
    pendente:     { label: 'Pendente',     classe: 'status-pendente'     },
    em_andamento: { label: 'Em Andamento', classe: 'status-em-andamento' },
    concluido:    { label: 'Concluído',    classe: 'status-concluido'    },
};


// ==========================================
// FORMULÁRIO — NOVO SERVIÇO
// ==========================================

// Preenche o <select> de clientes com dados da API
async function carregarClientesNoSelect() {

    const selectCliente = document.getElementById('selectCliente');

    try {
        const response = await fetch(`${API_URL}/clientes`);
        const data     = await response.json();

        if (data.total === 0) {
            selectCliente.innerHTML = '<option value="">Nenhum cliente cadastrado</option>';
            return;
        }

        // Monta as opções dinamicamente
        const opcoes = data.clientes
            .map(c => `<option value="${c.id}">${c.nome}</option>`)
            .join('');

        selectCliente.innerHTML = `<option value="">Selecione o cliente...</option>${opcoes}`;

    } catch (error) {
        selectCliente.innerHTML = '<option value="">Erro ao carregar clientes</option>';
        console.error('Erro ao carregar clientes:', error);
    }
}

// Envia o formulário de novo serviço
async function cadastrarServico() {

    const clienteId = document.getElementById('selectCliente').value;
    const descricao = document.getElementById('inputDescricao').value;
    const msgForm   = document.getElementById('msgForm');

    // Validação básica no front antes de chamar a API
    if (!clienteId) {
        msgForm.textContent = 'Selecione um cliente.';
        msgForm.style.color = 'orange';
        return;
    }

    if (!descricao.trim()) {
        msgForm.textContent = 'Preencha a descrição do serviço.';
        msgForm.style.color = 'orange';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/servicos`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                cliente_id: Number(clienteId), // Garantia: envia como número, não string
                descricao:  descricao.trim(),
            }),
        });

        const data = await response.json();

        if (response.ok) {

            msgForm.textContent = data.message;
            msgForm.style.color = 'green';

            // Limpa os campos do formulário
            document.getElementById('selectCliente').value  = '';
            document.getElementById('inputDescricao').value = '';

            setTimeout(() => { msgForm.textContent = ''; }, 3000);

            // Recarrega a tabela para mostrar o novo serviço
            await carregarServicos();

        } else {
            msgForm.textContent = data.error;
            msgForm.style.color = 'red';
        }

    } catch (error) {
        msgForm.textContent = 'Erro ao conectar com o servidor.';
        msgForm.style.color = 'red';
        console.error('Erro ao cadastrar serviço:', error);
    }
}


// ==========================================
// TABELA — LISTAGEM DE SERVIÇOS
// ==========================================

async function carregarServicos() {

    const msgCarregando  = document.getElementById('msgCarregando');
    const msgVazio       = document.getElementById('msgVazio');
    const tabelaWrapper  = document.getElementById('tabelaWrapper');
    const corpoTabela    = document.getElementById('corpoTabela');
    const totalRegistros = document.getElementById('totalRegistros');

    // Reseta o estado visual antes de buscar
    msgCarregando.classList.remove('hidden');
    tabelaWrapper.classList.add('hidden');
    msgVazio.classList.add('hidden');

    try {
        const response = await fetch(`${API_URL}/servicos`);
        const data     = await response.json();

        msgCarregando.classList.add('hidden');

        if (data.total === 0) {
            msgVazio.classList.remove('hidden');
            totalRegistros.textContent = '';
            return;
        }

        totalRegistros.textContent = `${data.total} registro(s)`;
        tabelaWrapper.classList.remove('hidden');

        // Gera o HTML de cada linha e junta tudo de uma vez no DOM
        // É mais eficiente do que adicionar linha por linha com appendChild
        corpoTabela.innerHTML = data.servicos
            .map(servico => criarLinhaTabela(servico))
            .join('');

    } catch (error) {
        msgCarregando.textContent = 'Erro ao conectar com o servidor.';
        msgCarregando.style.color = 'red';
        console.error('Erro ao carregar serviços:', error);
    }
}

// Monta o HTML de uma linha da tabela a partir dos dados de um serviço
function criarLinhaTabela(servico) {

    const config = STATUS_CONFIG[servico.status];

    // Gera as opções do select, marcando o status atual como selecionado
    const opcoesStatus = Object.entries(STATUS_CONFIG)
        .map(([valor, info]) => `
            <option value="${valor}" ${servico.status === valor ? 'selected' : ''}>
                ${info.label}
            </option>
        `)
        .join('');

    return `
        <tr id="linha-${servico.id}">
            <td>${servico.nome}</td>
            <td>${servico.email}</td>
            <td>${servico.telefone}</td>
            <td>${servico.descricao}</td>
            <td>
                <span class="badge-status ${config.classe}">
                    ${config.label}
                </span>
            </td>
            <td>
                <div class="acao-status">
                    <select id="select-${servico.id}" class="select-status">
                        ${opcoesStatus}
                    </select>
                    <button onclick="atualizarStatus(${servico.id})" class="btn-atualizar">
                        Salvar
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Atualiza o status de um serviço via PATCH
async function atualizarStatus(servicoId) {

    const select     = document.getElementById(`select-${servicoId}`);
    const novoStatus = select.value;

    try {
        const response = await fetch(`${API_URL}/servicos/${servicoId}/status`, {
            method:  'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ status: novoStatus }),
        });

        const data = await response.json();

        if (response.ok) {

            // Atualiza só o badge da linha — sem recarregar a tabela inteira
            const badge  = document.querySelector(`#linha-${servicoId} .badge-status`);
            const config = STATUS_CONFIG[novoStatus];

            // Remove a classe de cor antiga antes de adicionar a nova
            Object.values(STATUS_CONFIG).forEach(({ classe }) => badge.classList.remove(classe));
            badge.classList.add(config.classe);
            badge.textContent = config.label;

        } else {
            alert(data.error || 'Erro ao atualizar status.');
        }

    } catch (error) {
        alert('Erro ao conectar com o servidor.');
        console.error('Erro ao atualizar status:', error);
    }
}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // Carrega dados ao abrir a página
    carregarClientesNoSelect();
    carregarServicos();

    // Listener do botão de cadastrar serviço
    document.getElementById('btnCadastrar').addEventListener('click', cadastrarServico);
});
