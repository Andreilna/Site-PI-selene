# Frontend SELENE - Integrado ao Backend Atual

Este frontend reutiliza o layout existente e agora consome dados reais do backend atual (sem alterar o backend).

## Como rodar o backend

No diretório `backend`:

```bash
npm install
npm run dev
```

## Como rodar o frontend

No diretório `frontend`:

```bash
npm install
npm run dev
```

## Como configurar o `.env`

Crie/edite o arquivo `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=/api/v1
BACKEND_URL=http://localhost:3000
```

- `NEXT_PUBLIC_API_URL`: base usada pelo axios no frontend.
- `BACKEND_URL`: alvo do proxy do Next.js para evitar erro de CORS no navegador.

## Como testar a integração

1. Suba o backend e confirme:
   - `GET http://localhost:3000/api/v1/health`
2. Suba o frontend:
   - `http://localhost:3001` (ou porta exibida no terminal)
3. Faça login pela tela inicial.
4. Valide as telas:
   - `dashboard`: dados vindos de `/dashboard/principal` + colecoes reais
   - `farms`: dados vindos de `/plantas`
   - `estufas`: dados vindos de `/dispositivos` (tipo `ESP32_CAM`)
   - `sensores`: dados vindos de `/dispositivos` (tipo `ESP32_SENSORES`)
   - `reports`: dados vindos de `/alertas`
   - `produtores`: perfil real de `/auth/perfil`

## Observacao de mapeamento

Como o layout foi herdado de outro projeto, alguns nomes de campos/telas foram mantidos visualmente e mapeados para as entidades reais da API atual.
