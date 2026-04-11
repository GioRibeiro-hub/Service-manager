# Service Manager

Sistema web desenvolvido para gerenciar clientes e os serviços realizados para eles.
O projeto foi desenvolvido como parte da disciplina **Projeto de Software**, com o objetivo de praticar desenvolvimento **full stack** utilizando tecnologias web.


## Objetivo do Projeto

O **Service Manager** tem como objetivo centralizar o gerenciamento de clientes e serviços prestados, permitindo que profissionais ou pequenas empresas organizem melhor suas informações.

Muitos profissionais utilizam planilhas, anotações ou mensagens para controlar clientes e serviços. O sistema busca resolver esse problema oferecendo uma interface simples para cadastro e consulta de dados.


## Funcionalidades

* Cadastro de clientes
* Armazenamento em banco de dados
* Retorno de confirmação de cadastro
* Feedback visual no front-end
* Listagem de clientes cadastrados
* Edição de clientes
* Exclusão de clientes
* Cadastro de serviços
* Vinculação de serviços a clientes

##  Tecnologias Utilizadas

### Front-end

* HTML
* CSS
* JavaScript

### Back-end

* Node.js
* Express

### Banco de Dados

* MySQL

### Ferramentas

* Git
* GitHub
* Trello (gerenciamento)

## Como executar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/GioRibeiro-hub/Service-Manager.git
```

### 2. Instalar dependências

Dentro da pasta do backend:

cd back

```bash
npm install
```

### 3. Iniciar o servidor

```bash
node server.js
```

O servidor iniciará em:

```
http://localhost:3000
```
##  Banco de Dados

Exemplo de estrutura da tabela de clientes:

```sql
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    email VARCHAR(100),
    telefone VARCHAR(20)
);
```
## Gerenciamento do Projeto

O projeto é organizado utilizando **metodologia ágil com sprints**, gerenciadas através de um board no Trello.

Cada sprint adiciona uma nova funcionalidade ao sistema.
