# 📱 Guia de Integração e Arquitetura: TV Barão Mobile

Este documento serve como a **especificação técnica completa** para o desenvolvimento do aplicativo **`tv-barao-mobile` (React Native / Expo)**, detalhando o estado atual do ecossistema, o banco de dados Supabase e o protocolo de comunicação em tempo real com a TV.

---

## 🌐 1. Credenciais do Backend (Supabase)

O aplicativo mobile deve se conectar ao mesmo projeto Supabase da aplicação web:

* **Supabase URL:** `https://hvfznilryscauyfgxkrd.supabase.co`
* **Supabase Anon Key:** `sb_publishable_QNNPntR5_EkynmSdfzf-6g_d--GXAdU`

### 📦 Inicialização no React Native:
```javascript
// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = "https://hvfznilryscauyfgxkrd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_QNNPntR5_EkynmSdfzf-6g_d--GXAdU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

---

## 🗄️ 2. Estrutura do Banco de Dados

### 📊 Tabela: `avisos`

Guarda todos os comunicados que rotacionam na TV e a configuração do rodapé (letreiro).

| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| **`id`** | `int8` | Sim (PK) | Identificador numérico gerado automaticamente |
| **`titulo`** | `text` | Sim | Título do comunicado (ou `'LETREIRO'` para o rodapé) |
| **`descricao`** | `text` | Sim | Texto detalhado do aviso ou mensagem do letreiro |
| **`categoria`** | `text` | Sim | Define o **layout visual** na TV ou se é `'Letreiro'` |
| **`duracao`** | `int4` | Sim | Tempo de exibição na TV em segundos (ex: `10`) |
| **`horario`** | `text` | Não | Texto informativo de horário/evento (ex: `'08:00h'`) |
| **`link_fundo`**| `text` | Não | URL pública da foto/vídeo salva no Storage |
| **`created_at`**| `timestamptz` | Sim | Data e hora de criação automática |

---

### 🎨 3. Os 5 Modelos de Layout da TV

Ao cadastrar um novo aviso pelo app mobile, a coluna **`categoria`** deve receber exatamente um destes valores para a TV renderizar o layout correto:

1. **`"Layout 1: Foto Inteira"`** ➔ Foto/Vídeo em tela cheia com card translúcido no rodapé.
2. **`"Layout 2: Cyber Dashboard"`** ➔ Split Screen: Texto na esquerda e foto na direita.
3. **`"Layout 3: Minimalista Sem Foto"`** ➔ Editorial nobre focado apenas em texto (sem imagem).
4. **`"Layout 4: Alerta Critico"`** ➔ 100% Imagem/Vídeo limpo em tela cheia (sem nenhum texto por cima).
5. **`"Layout 5: Revista (Foto Esquerda)"`** ➔ Split Screen invertido: Imagem na esquerda e texto na direita.

> ⚠️ **Aviso Especial do Rodapé:**  
> Para alterar o letreiro inferior da TV, insere-se um registro com `categoria = 'Letreiro'` e `titulo = 'LETREIRO'`.

---

## 📦 4. Supabase Storage (Upload de Fotos e Vídeos)

* **Bucket oficial:** `imagens-mural` (Público)
* **Fluxo no React Native:**
  1. O usuário tira uma foto com `expo-image-picker` ou `expo-camera`.
  2. Converte a imagem para `ArrayBuffer` ou `Blob`.
  3. Envia para o bucket com um nome único (`${Date.now()}_foto.jpg`).
  4. Obtém a URL pública (`getPublicUrl`) e grava na coluna `link_fundo` da tabela `avisos`.

```javascript
// Exemplo de upload no React Native
export async function uploadFoto(uri) {
  const response = await fetch(uri);
  const blob = await response.blob();
  const arrayBuffer = await new Response(blob).arrayBuffer();
  
  const fileName = `${Date.now()}_foto.jpg`;
  const { error } = await supabase.storage
    .from('imagens-mural')
    .upload(fileName, arrayBuffer, { contentType: 'image/jpeg' });

  if (error) throw error;

  const { data } = supabase.storage.from('imagens-mural').getPublicUrl(fileName);
  return data.publicUrl;
}
```

---

## 🔐 5. Autenticação de Professores e Servidores

O acesso ao app é restrito à rede de servidores da educação:
* **E-mails autorizados:** Devem terminar com `@prof.educacao.sp.gov.br` ou o e-mail de desenvolvedor `luisgc9872@gmail.com`.
* **Métodos utilizados:**
  * Login: `supabase.auth.signInWithPassword({ email, password })`
  * Cadastro: `supabase.auth.signUp({ email, password })`

---

## ⚡ 6. Protocolo de Comunicação em Tempo Real (Controle Remoto)

Para o **Controle Remoto da TV**, o app mobile e a TV web utilizam o canal de **Supabase Realtime Broadcast** (WebSocket com latência < 100ms):

* **Nome do Canal:** `'canal-tv-barao'`
* **Nome do Evento:** `'comando-remoto'`

### 🕹️ Ações Suportadas pelo Protocolo:

| Ação (`acao`) | Parâmetros Adicionais | Efeito Imediato na TV |
| :--- | :--- | :--- |
| **`"PAUSAR"`** | - | Congela a contagem de tempo do slide atual. |
| **`"RETOMAR"`** | - | Descongela e retoma a rotação automática. |
| **`"PROXIMO"`** | - | Pula imediatamente para o próximo slide. |
| **`"ANTERIOR"`**| - | Volta imediatamente para o slide anterior. |
| **`"FIXAR"`** | `slideId: number` | Trava a exibição no comunicado selecionado. |
| **`"ALERTA"`** | `mensagem: string` | Exibe tarja vermelha de emergência piscando na tela. |
| **`"FECHAR_ALERTA"`** | - | Remove a tarja de emergência. |

### 📡 Como o App Mobile Envia Comandos:

```javascript
// src/services/remoteControl.js
import { supabase } from './supabase';

const canalTV = supabase.channel('canal-tv-barao');
canalTV.subscribe();

export const enviarComandoTV = (acao, payload = {}) => {
  canalTV.send({
    type: 'broadcast',
    event: 'comando-remoto',
    payload: { acao, ...payload, timestamp: Date.now() }
  });
};
```

---

## 🚀 7. Checklist de Telas do App Mobile

1. 🔐 **LoginScreen:** Autenticação de professores com validação `@prof.educacao.sp.gov.br`.
2. 🕹️ **RemoteScreen:** Interface de controle remoto com botões táteis (Play, Pause, Next, Prev, Fixar).
3. 📸 **PublishScreen:** Abertura da câmera nativa, escolha do modelo de layout (1 a 5) e envio com barra de progresso.
4. 🚨 **AlertScreen:** Envio de alertas de emergência e atualização rápida do letreiro de rodapé.
5. 📋 **ManageScreen:** Lista de comunicados com botões para excluir ou desativar avisos.
