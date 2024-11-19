# Desafio Full Cycle - Node.js com Nginx e MySQL

Este projeto é um desafio que implementa uma aplicação Node.js com Nginx como proxy reverso e MySQL como banco de dados, tudo rodando em containers Docker.

## 🚀 Estrutura do Projeto

```bash
.
├── docker-compose.yaml
├── nginx/
│ ├── Dockerfile.prod
│ └── nginx.conf
├── node/
│ ├── Dockerfile
│ ├── Dockerfile.prod
│ ├── index.js
│ ├── package.json
│ └── package-lock.json
└── README.md
```

## 📋 Requisitos

- Docker
- Docker Compose

## 🔧 Componentes

### Node.js Application
- Roda na porta 3000
- Conecta com MySQL
- Cria uma tabela `people`
- Retorna uma página HTML com a mensagem "Full Cycle Rocks!"

### Nginx
- Atua como proxy reverso
- Roda na porta 8080
- Redireciona requisições para a aplicação Node.js

### MySQL
- Banco de dados MySQL 5.7
- Armazena os dados da aplicação
- Roda na porta 3306

## 🛠️ Como Executar

1. Clone o repositório:
```
git clone https://github.com/Vitorir/docker_desafio2
```

2. Inicie os containers:
```
docker-compose up -d
```

3. Acesse a aplicação
```
http://localhost:8080
```

## 📦 Containers

- **app**: Aplicação Node.js
- **nginx**: Servidor Nginx (proxy reverso)
- **db**: Banco de dados MySQL

## 🔍 Verificando os Logs




## 🗃️ Estrutura do Banco de Dados

A aplicação cria automaticamente:
- Database: `nodedb`
- Tabela: `people`
  - Campos:
    - id (INT, AUTO_INCREMENT, PRIMARY KEY)
    - name (VARCHAR(255))

## 🔀 Fluxo da Aplicação

1. Usuário acessa localhost:8080
2. Nginx recebe a requisição e encaminha para o Node.js (app:3000)
3. Node.js processa a requisição, consulta o MySQL
4. Retorna uma página HTML com os dados

## 🛑 Parando a Aplicação

Para parar todos os containers:
```
docker-compose down
```


## 🔨 Desenvolvimento

Para desenvolvimento local, os arquivos da aplicação Node.js estão mapeados em um volume, permitindo alterações em tempo real sem necessidade de rebuild do container.

## 📝 Notas

- O arquivo `.gitignore` está configurado para ignorar `node_modules/` e arquivos do MySQL
- O Dockerize é utilizado para garantir que o Node.js só inicie após o MySQL estar pronto
- Volumes persistentes são usados para o MySQL
