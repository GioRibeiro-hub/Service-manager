const express = require('express');
const cors    = require('cors');
const pool    = require('./database');

const app = express();

app.use(cors());
app.use(express.json());


// ==========================================
// ROTAS DE CLIENTES
// ==========================================

// Cadastrar cliente
app.post('/clientes', async (req, res) => {

    const { nome, email, telefone } = req.body;

    if (!nome?.trim() || !email?.trim() || !telefone?.trim()) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Email inválido.' });
    }

    try {
        const sql = `INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?)`;
        const [result] = await pool.query(sql, [nome.trim(), email.trim(), telefone.trim()]);

        const [[cliente]] = await pool.query('SELECT * FROM clientes WHERE id = ?', [result.insertId]);

        res.status(201).json({ message: 'Cliente cadastrado com sucesso!', cliente });

    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Este email já está cadastrado.' });
        }
        console.error('Erro ao cadastrar cliente:', err);
        res.status(500).json({ error: 'Erro interno ao cadastrar cliente.' });
    }
});

// Listar todos os clientes
app.get('/clientes', async (req, res) => {

    try {
        const [rows] = await pool.query('SELECT * FROM clientes ORDER BY nome ASC');
        res.json({ total: rows.length, clientes: rows });

    } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        res.status(500).json({ error: 'Erro interno ao buscar clientes.' });
    }
});


// ==========================================
// ROTAS DE SERVIÇOS
// ==========================================

// Listar todos os serviços com dados do cliente (JOIN)
app.get('/servicos', async (req, res) => {

    try {
        const [rows] = await pool.query(`
            SELECT
                s.id,
                s.descricao,
                s.status,
                s.criado_em,
                c.id       AS cliente_id,
                c.nome,
                c.email,
                c.telefone
            FROM servicos s
            INNER JOIN clientes c ON s.cliente_id = c.id
            ORDER BY s.criado_em DESC
        `);

        res.json({ total: rows.length, servicos: rows });

    } catch (err) {
        console.error('Erro ao buscar serviços:', err);
        res.status(500).json({ error: 'Erro interno ao buscar serviços.' });
    }
});

// Cadastrar novo serviço
app.post('/servicos', async (req, res) => {

    const { cliente_id, descricao } = req.body;

    if (!cliente_id || !descricao?.trim()) {
        return res.status(400).json({ error: 'cliente_id e descricao são obrigatórios.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO servicos (cliente_id, descricao) VALUES (?, ?)',
            [cliente_id, descricao.trim()]
        );

        const [[servico]] = await pool.query(
            'SELECT * FROM servicos WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({ message: 'Serviço cadastrado com sucesso!', servico });

    } catch (err) {
        console.error('Erro ao cadastrar serviço:', err);
        res.status(500).json({ error: 'Erro interno ao cadastrar serviço.' });
    }
});

// Atualizar status de um serviço
app.patch('/servicos/:id/status', async (req, res) => {

    const { id }     = req.params;
    const { status } = req.body;

    const statusValidos = ['pendente', 'em_andamento', 'concluido'];

    if (!statusValidos.includes(status)) {
        return res.status(400).json({ error: 'Status inválido.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE servicos SET status = ? WHERE id = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Serviço não encontrado.' });
        }

        res.json({ message: 'Status atualizado com sucesso!' });

    } catch (err) {
        console.error('Erro ao atualizar status:', err);
        res.status(500).json({ error: 'Erro interno ao atualizar status.' });
    }
});


app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
