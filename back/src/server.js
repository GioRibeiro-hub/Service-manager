const express = require('express');
const cors    = require('cors');
const pool    = require('./database');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/clientes', async (req, res) => {

    const { nome, email, telefone } = req.body;

    // Validação dos campos
    if (!nome?.trim() || !email?.trim() || !telefone?.trim()) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Email inválido.' });
    }

    try {
        const sql = `
            INSERT INTO clientes (nome, email, telefone)
            VALUES (?, ?, ?)
        `;

        const [result] = await pool.query(sql, [nome.trim(), email.trim(), telefone.trim()]);

        const [[cliente]] = await pool.query(
            'SELECT * FROM clientes WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            message: 'Cliente cadastrado com sucesso!',
            cliente,
        });

    } catch (err) {

        // Email duplicado (UNIQUE constraint)
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Este email já está cadastrado.' });
        }

        console.error('Erro ao cadastrar cliente:', err);
        res.status(500).json({ error: 'Erro interno ao cadastrar cliente.' });
    }
});


app.get('/clientes', async (req, res) => {

    try {
        const [rows] = await pool.query('SELECT * FROM clientes ORDER BY nome ASC');

        res.json({
            total: rows.length,
            clientes: rows,
        });

    } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        res.status(500).json({ error: 'Erro interno ao buscar clientes.' });
    }
});


app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
