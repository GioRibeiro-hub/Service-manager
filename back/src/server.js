const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/clientes', (req, res) => {
    console.log(req.body);
    res.json({ message: 'Cliente recebido com sucesso!'});
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});

