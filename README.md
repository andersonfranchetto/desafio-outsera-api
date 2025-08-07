# 🎬 Outsera Movies API

API desenvolvida com **NestJS** para analisar filmes vencedores de prêmios e calcular os **intervalos de premiação de produtores**.

## 📦 Tecnologias Utilizadas

- [NestJS](https://nestjs.com/) - Framework Node.js
- [TypeORM](https://typeorm.io/) - ORM para manipulação de banco de dados
- [SQLite (em memória)](https://www.sqlite.org/) - Banco leve para desenvolvimento/testes
- [CSV Parser](https://www.npmjs.com/package/csv-parser) - Leitura de arquivos `.csv`
- [Swagger](https://swagger.io/) - Documentação interativa da API
- [Jest](https://jestjs.io/) + [Supertest](https://github.com/visionmedia/supertest) - Testes automatizados

---

## 🚀 Como executar o projeto

### 1. Instalar dependências

```bash
npm install
```

### 2. Rodar a aplicação em modo dev

```bash
npm run start:dev
```

### 🧪 Rodar testes

```bash
npm run test
```

### 📂 Estrutura de Pastas
```
src/
├── data/
│   └── movielist.csv
├── movies/
│   ├── dtos/
│   ├── entities/
│   └──[controllers and services]
├── app.module.ts
├── main.ts
test/
└── integration
    └── movies.e2e.spec.ts
```

### 🔎 Endpoints Principais

`GET /movies/intervals`

#### Retorna os produtores com:

- Menor intervalo entre vitórias consecutivas
- Maior intervalo entre vitórias consecutivas

#### Exemplo de resposta:

```json
{
  "min": [
    {
      "producer": "Producer A",
      "interval": 1,
      "previousWin": 2000,
      "followingWin": 2001
    }
  ],
  "max": [
    {
      "producer": "Producer B",
      "interval": 13,
      "previousWin": 1990,
      "followingWin": 2003
    }
  ]
}
```

### 📑 Documentação Swagger

#### Após iniciar o projeto, acesse:
http://[localhost]:[port]/api/docs

### 🗃️ CSV Esperado
#### O arquivo `movielist.csv` deve seguir o seguinte formato (separado por ponto-vírgula):

```csv
year ; title                ; studios                      ; producers                                                   ; winner
1980 ; Can't Stop the Music ; Associated Film Distribution ; Allan Carr                                                  ; true
2017 ; The Mummy            ; Universal Pictures           ; Alex Kurtzman, Chris Morgan, Sean Daniel and Sarah Bradshaw ;
```

- Campos obrigatórios: `year`, `title`, `producers`
- Campos opcionais: `winner`

### 🧠 Lógica de Negócio
- Seeding automático do banco a partir do CSV (db in-memory)
- Cada produtor pode ter múltiplas vitórias
- É considerado "intervalo" o tempo entre duas vitórias consecutivas do mesmo produtor
- O endpoint retorna o(s) produtor(es) com menor e maior intervalo

### 🛠️ Ambiente de Desenvolvimento
- Variáveis de ambiente (opcional)
- Você pode criar um .env:

```env
PORT=3000
NODE_ENV=development
```

### 👤 Author
`Anderson Franchetto`<br/>
`https://www.linkedin.com/in/anderson-franchetto/`
