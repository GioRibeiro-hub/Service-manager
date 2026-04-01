-- ============================================================
-- Service Manager — Script de criação da tabela de serviços
-- Execute no seu banco MySQL após criar a tabela de clientes
-- ============================================================

CREATE TABLE servicos (
    id          INT          AUTO_INCREMENT PRIMARY KEY,
    cliente_id  INT          NOT NULL,
    descricao   VARCHAR(255) NOT NULL,
    status      ENUM('pendente', 'em_andamento', 'concluido') DEFAULT 'pendente',
    criado_em   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    -- Chave estrangeira: garante que cliente_id exista na tabela clientes
    -- ON DELETE CASCADE: apagar o cliente remove os serviços vinculados automaticamente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);
