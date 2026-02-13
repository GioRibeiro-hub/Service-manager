const express = require('express');
const cors = require('cors');
const connection = require('./database');

const app = express();

app.use(cors());
app.use(express.json());

/*
=====================================
ROTA PARA CADASTRAR CLIENTE
=====================================
*/
app.post('/clientes', (req, res) => {

    const { nome, email, telefone } = req.body;

    const sql = `
        INSERT INTO clientes (nome, email, telefone)
        VALUES (?, ?, ?)
    `;

    connection.query(sql, [nome, email, telefone], (err, result) => {

        if (err) {
            console.error('Erro ao inserir:', err);
            return res.status(500).json({ error: 'Erro ao cadastrar cliente' });
        }

        const idInserido = result.insertId;

        // Buscar o cliente recém inserido
        connection.query(
            "SELECT * FROM clientes WHERE id = ?",
            [idInserido],
            (err2, rows) => {

                if (err2) {
                    console.error('Erro ao buscar cliente:', err2);
                    return res.status(500).json({ error: 'Erro ao buscar cliente' });
                }

                res.json({
                    message: 'Cliente cadastrado com sucesso!',
                    cliente: rows[0]
                });
            }
        );
    });
});


/*
=====================================
ROTA PARA LISTAR TODOS OS CLIENTES
=====================================
*/
app.get('/clientes', (req, res) => {

    const sql = "SELECT * FROM clientes";

    connection.query(sql, (err, rows) => {

        if (err) {
            console.error('Erro ao buscar clientes:', err);
            return res.status(500).json({ error: 'Erro ao buscar clientes' });
        }

        res.json({
            total: rows.length,
            clientes: rows
        });
    });
});


app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
