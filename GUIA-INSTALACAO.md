# 🚀 GUIA COMPLETO - LEIXÕES GESTOR (Firebase + React)

## ⚡ RESUMO
- App web profissional com React
- Dados em nuvem com Firebase (grátis)
- Multi-utilizador em tempo real
- Deploy grátis em Vercel

---

## PASSO 1️⃣: Preparar Firebase

### 1.1 - Aceder a Firebase Console
1. Vá a **https://console.firebase.google.com**
2. Clique em **"Criar Projeto"**
3. Nome: `leixoes-gestor-equipas`
4. Desmarque "Google Analytics" (não precisa)
5. Clique **"Criar Projeto"** e aguarde

### 1.2 - Copiar Credenciais Firebase
Quando o projeto estiver pronto:
1. Clique no ícone **⚙️ (Configurações do Projeto)**
2. Vá a **"Suas apps"** → **"Web"** (ícone `</>`
3. Se não existir, clique em **"Adicionar app"** → **"Web"**
4. Copie o objeto `firebaseConfig`:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "leixoes-...",
  projectId: "leixoes-...",
  storageBucket: "leixoes-...",
  messagingSenderId: "...",
  appId: "..."
};
```

### 1.3 - Ativar Autenticação
1. No Firebase, vá a **"Authentication"** (esquerda)
2. Clique em **"Começar"**
3. Clique em **"Email/Senha"**
4. Ative **"Email/Senha"** e **"Permitir inscrição"**
5. Clique **"Salvar"**

### 1.4 - Ativar Firestore
1. Vá a **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Modo: **"Modo de teste"**
4. Localização: **"Europe (eur3)"** ou a mais próxima
5. Clique **"Criar"**

---

## PASSO 2️⃣: Instalar e Configurar App React

### 2.1 - Criar Projeto
Abra o terminal e execute:
```bash
npm create vite@latest leixoes-app -- --template react
cd leixoes-app
npm install
npm install firebase react-router-dom
```

### 2.2 - Copiar Ficheiros
Substitua/crie os ficheiros:
- `src/App.jsx` (código do App.jsx fornecido)
- `src/App.css` (código do App.css fornecido)
- `src/firebase.js` (código do firebase.js fornecido)

### 2.3 - Configurar Firebase
Abra `src/firebase.js` e substitua:
```javascript
const firebaseConfig = {
  apiKey: "COLE_AQUI_SUA_API_KEY",
  authDomain: "COLE_AQUI_AUTH_DOMAIN",
  projectId: "COLE_AQUI_PROJECT_ID",
  storageBucket: "COLE_AQUI_STORAGE_BUCKET",
  messagingSenderId: "COLE_AQUI_MESSAGING_ID",
  appId: "COLE_AQUI_APP_ID"
};
```

### 2.4 - Testar Localmente
```bash
npm run dev
```
Abre em `http://localhost:5173`

---

## PASSO 3️⃣: Deploy em Vercel (Grátis)

### 3.1 - Preparar para Deploy
```bash
npm run build
```

### 3.2 - Criar Conta Vercel
1. Vá a **https://vercel.com**
2. Clique em **"Sign Up"**
3. Escolha **"GitHub"** (mais fácil) ou email

### 3.3 - Conectar Repositório (se usou GitHub)
1. Após criar conta, clique **"Import Project"**
2. Selecione o repositório `leixoes-app`
3. Clique **"Import"**
4. Vercel faz deploy automaticamente!

### 3.4 - Deploy Manual (sem GitHub)
Se não tem GitHub:
1. Instale Vercel CLI: `npm i -g vercel`
2. Execute: `vercel`
3. Siga as instruções na consola
4. Deploy feito! URL gerada automaticamente

---

## ✅ RESULTADO FINAL

Sua app estará em: **`seu-leixoes-app.vercel.app`**

Qualquer pessoa pode aceder com:
- Email: qualquer email (ex: `staff@leixoes.pt`)
- Password: qualquer password (cria conta automaticamente)

---

## 🔧 FUNCIONALIDADES

### Implementadas:
✅ Login/Signup
✅ Adicionar Equipas
✅ Adicionar Recrutas
✅ Visualizar dados em tempo real
✅ Eliminar registos

### Por Implementar:
⏳ Formação 4-3-3
⏳ Equipas Sombra com resumo
⏳ Reuniões
⏳ Editar registos
⏳ Treinos à Experiência

---

## 🐛 RESOLUÇÃO DE PROBLEMAS

### "Firebase não conecta"
- Verifique as credenciais em `firebase.js`
- Verifique se Firestore está ativo
- Verifique se Authentication está ativa

### "Vercel não vê a app"
- Verifique se correu `npm run build`
- Verifique se tem `vite.config.js` correto

### "Dados não aparecem"
- Abra DevTools (F12) → Console
- Verifique se há erros
- Verifique se dados estão em Firestore

---

## 📞 SUPORTE

Se tiver dúvidas:
1. Leia o README.md do projeto
2. Verifique a documentação: https://firebase.google.com/docs
3. Consulte: https://react.dev

---

**Parabéns! Sua app profissional está online! 🎉**
