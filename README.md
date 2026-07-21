# Sicarius / Vulnerabilities Scanner

Plataforma web para análise automatizada de vulnerabilidades em sites, usando a API REST do **OWASP ZAP**. Permite cadastrar sites, disparar Spider + Active Scan, acompanhar o progresso, consultar histórico e gerar relatórios de segurança.

> Use apenas em sites que você possui ou tem autorização explícita para testar. Escanear sites de terceiros sem permissão pode ser ilegal.

**Segurança:** OWASP ZAP (Spider + Active Scan via API REST)

## Equipe de Desenvolvimento

Este projeto foi construído de forma colaborativa pelos seguintes autores:

| Nome Completo | Perfil GitHub |
| :--- | :--- |
| **Nouan Dzulinski** | [github.com/niratori](https://github.com/niratori) |
| **Luana Kulczyk** | [github.com/katsukiluana-cyber](https://github.com/katsukiluana-cyber) |

## Arquitetura (backend em camadas)

```
backend/src/
├── config/         # env, conexão com MongoDB
├── controllers/    # camada HTTP (recebe req, chama service, devolve resposta)
├── services/       # regra de negócio (auth, sites, scans, integração ZAP)
├── repositories/   # acesso a dados (Mongoose)
├── models/         # schemas Mongoose (Usuario, Site, Scan, Vulnerabilidade)
├── routes/         # definição das rotas Express
├── middlewares/     # auth, validação (Zod), erros, rate limit
└── utils/          # logger, AppError, respostas padronizadas, segurança de URL
```

## Pré-requisitos

- Node.js 18+
- MongoDB Atlas (ou local)
- OWASP ZAP rodando em modo daemon com API habilitada (`zap.sh -daemon -port 8080 -config api.key=SUA_CHAVE`)

## Como rodar localmente

### Backend

```bash
Vá até o diretório do backend utilizando:
cd backend
Logo após isso, você deve utilizar o arquvio .env.example como base para criar o arquivo .env real, onde deverá ser preenchido com as seguintes informações:
Deve colocar sua string de conexão no MONGO_URI, preencher JWT_SECRET, ZAP_API_URL, ZAP_API_KEY
Após o preenchimento dessas informações, você também deve rodar os seguintes códigos no terminal:
npm install
E para começar a rodar localmente, utilize o próximo comando:
npm run dev             # http://localhost:5000
```

### Frontend

```bash
Aqui o processo se repete, vá até a pasta do frontend com o seguinte comando:
cd frontend
Logo após, siga como base o .env.example para preencher o .env, você pode copiar o arquivo usando:
cp .env.example .env    # Logo após, ajuste VITE_API_URL se for necessário.
E então, rode o frontend com:
npm install
npm run dev             # http://localhost:5173
```

## Variáveis de ambiente (backend)

| Variável | Descrição |
|---|---|
| `MONGO_URI` | String de conexão do MongoDB Atlas |
| `JWT_SECRET` | Segredo usado para assinar os tokens JWT |
| `JWT_EXPIRES_IN` | Validade do token (ex: `7d`) |
| `ZAP_API_URL` | URL da API do OWASP ZAP (ex: `http://localhost:8080`) |
| `ZAP_API_KEY` | Chave de API configurada no ZAP |
| `FRONTEND_URL` | URL do frontend, usada no CORS |

## Segurança implementada

- Senhas com hash bcrypt (12 salt rounds)
- Autenticação via JWT
- Validação de entrada com Zod em todas as rotas de escrita
- Helmet (cabeçalhos HTTP seguros), CORS restrito ao frontend configurado, rate limiting global
- Bloqueio de URLs apontando para redes internas/privadas antes de enviar ao ZAP (proteção contra SSRF)
- Cada usuário só acessa seus próprios sites/scans (ownership check em toda operação).
