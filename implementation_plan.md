# 📱 Plano de Implementação: App Mobile TV Barão (React Native)

Este documento detalha **o que é o aplicativo móvel**, suas **funcionalidades**, **público-alvo**, **arquitetura técnica** e o **roteiro de desenvolvimento** em **React Native (Expo)** integrado ao ecossistema existente da **TV Barão / PEI Barão de Jundiaí**.

---

## 💡 O que é o Aplicativo Mobile?

O **TV Barão Mobile** é um aplicativo nativo para smartphones (Android e iOS) desenvolvido para colocar o **controle total do Mural Digital da escola na palma da mão dos professores e da equipe gestora**.

Em vez de depender de um computador para atualizar os murais ou manusear controles físicos da TV, o professor utiliza o próprio smartphone como:
1. **Controle Remoto Inteligente em Tempo Real**: Pausa, avança, volta e fixa comunicados na TV do pátio ou sala dos professores instantaneamente via WebSocket.
2. **Estação de Publicação Ágil**: Captura fotos e vídeos de projetos, eventos e feiras de ciências com a câmera do celular e publica na TV em segundos.
3. **Botão de Alerta Flash / Emergência**: Dispara avisos urgentes (ex: alterações de portão, avisos climáticos ou recados da direção) com sobreposição visual imediata na TV.
4. **Gerenciador de Rodapé e Mídias**: Edita o letreiro contínuo da TV e ativa/desativa comunicados com toggles simples sem precisar excluir do banco.

---

## 👥 Público-Alvo e Cenários de Uso

| Perfil | Caso de Uso Prático |
| :--- | :--- |
| **Professores** | Estão no pátio ou laboratório, tiram foto de uma atividade dos alunos e transmitem direto para a TV do pátio com legenda e layout escolhido na hora. |
| **Coordenação Pedagógica** | Durante o intervalo ou entrada de alunos, fixa na TV o slide com o cronograma de provas ou chamada de reuniões. |
| **Direção / Secretaria** | Dispara avisos rápidos ou aciona o modo de alerta institucional de qualquer lugar da escola pelo celular. |

---

## 🕹️ Funcionalidades Detalhadas do App

### 1️⃣ Autenticação Institucional
- Login protegido com validação de e-mails institucionais (`@prof.educacao.sp.gov.br` e e-mails administrativos autorizados).
- Sessão persistente e segura via **Supabase Auth**.

### 2️⃣ Controle Remoto da TV (Tempo Real / Realtime)
- **Botões de Reprodução**:
  - ⏸️ **Pausar / ▶️ Retomar**: Congela a rotação automática dos slides na TV.
  - ⏭️ **Próximo / ⏮️ Anterior**: Pula ou volta manualmente para qualquer comunicado.
  - 📌 **Fixar Slide**: Mantém um comunicado específico travado na tela durante uma apresentação ou evento.
- **Feedback Visual de Status**: Mostra no celular qual slide está sendo exibido na TV naquele momento exato.

### 3️⃣ Publicação Instantânea com Câmera do Celular
- **Integração com Câmera e Galeria Nativa**:
  - Captura direta de fotos/vídeos pelo app (`expo-camera` / `expo-image-picker`).
  - Compressão e otimização leve de imagem antes do envio (`expo-image-manipulator`) para economizar dados e acelerar o upload.
- **Seleção de Layouts**: Escolha rápida entre os 5 modelos visuais já consagrados no projeto:
  - *Modelo 1*: Foto em Tela Cheia com Card Translúcido
  - *Modelo 2*: Split Dashboard (Texto na Esquerda + Imagem na Direita)
  - *Modelo 3*: Editorial Nobre (Apenas Texto)
  - *Modelo 4*: Exclusivo de Mídia (100% Imagem/Vídeo)
  - *Modelo 5*: Revista Class (Imagem na Esquerda + Texto na Direita)
- **Envio Direto ao Supabase Storage** (`imagens-mural`) com barra de progresso.

### 4️⃣ Alerta Crítico & Letreiro
- **Alerta de Emergência / Flash**:
  - Campo de texto rápido com botão de disparo em vermelho neon.
  - Ao ser acionado, a TV exibe uma tarja de emergência com destaque visual prioritário.
  - Botão de desativar alerta quando a emergência terminar.
- **Edição Rápida de Letreiro**:
  - Atualização do texto corrido do rodapé da TV com 1 toque.

### 5️⃣ Gerenciamento de Comunicados
- Lista com cards de todos os avisos cadastrados no banco de dados.
- Interruptor Liga/Desliga (*Toggle Switch*): oculta temporariamente um aviso da TV sem precisar apagá-lo.
- Opção de excluir avisos obsoletos.

---

## 🛠️ Stack Tecnológica

* **Framework Mobile**: React Native com Expo (SDK 51+)
* **Linguagem**: JavaScript / JSX
* **Backend & Banco de Dados**: Supabase (PostgreSQL)
* **Comunicação em Tempo Real**: Supabase Realtime (WebSockets / Broadcast)
* **Storage de Mídia**: Supabase Storage (`imagens-mural`)
* **Navegação**: React Navigation (Bottom Tabs + Native Stack)
* **Manipulação de Câmera/Mídia**: `expo-camera`, `expo-image-picker`, `expo-image-manipulator`
* **Design & Ícones**: `lucide-react-native`, Paleta Futurista Dark/Neon idêntica à identidade visual da TV Barão.

---

## 📐 Estrutura de Pastas Proposta

```
projeto-tv-barao-main/
├── src/                        # Aplicação Web (TV e Painel Desktop)
├── mobile/                     # 📱 Aplicativo React Native (Expo)
│   ├── assets/                 # Ícones, logo e splash screen
│   ├── src/
│   │   ├── services/
│   │   │   ├── supabase.js     # Conexão Supabase e listeners Realtime
│   │   │   └── remoteService.js# Emissão de comandos para a TV
│   │   ├── screens/
│   │   │   ├── LoginScreen.jsx # Login institucional
│   │   │   ├── RemoteScreen.jsx# Controle remoto tátil com botões grandes
│   │   │   ├── PublishScreen.jsx # Captura de fotos e novo comunicado
│   │   │   ├── AlertScreen.jsx # Alerta de emergência e letreiro
│   │   │   └── ManageScreen.jsx# Gerenciador de cards ativos
│   │   ├── theme/
│   │   │   └── colors.js       # Cores Neon/Dark (identidade Barão)
│   │   └── navigation/
│   │       └── AppNavigator.jsx# Abas inferiores (Tabs)
│   ├── App.js                  # Ponto de entrada
│   ├── app.json                # Configurações do Expo
│   └── package.json
```

---

## 📋 Plano de Execução

1. **Fase 1: Inicialização do App Mobile Expo**:
   - Criação da pasta `mobile/` e instalação das dependências essenciais.
2. **Fase 2: Conexão Realtime com a TV Web**:
   - Implementação do canal de sincronização no app e na tela da TV (`src/TvScreen.jsx`).
3. **Fase 3: Construção das Telas Nativas**:
   - Telas de Login, Controle Remoto, Publicação com Câmera, Alertas e Gerenciador.
4. **Fase 4: Testes de Integração**:
   - Teste no celular físico via Expo Go e validação de latência com a TV.
