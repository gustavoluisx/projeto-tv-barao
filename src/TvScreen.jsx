import { useState, useEffect, useRef } from 'react';

export default function TvScreen({ supabase }) {
  const [horaAtual, setHoraAtual] = useState('');
  const [cards, setCards] = useState([]);
  const [cardAtualIndex, setCardAtualIndex] = useState(0);
  const [textoLetreiro, setTextoLetreiro] = useState('Painel Informativo PEI Barão de Jundiaí');
  const [pausada, setPausada] = useState(false);
  const [fixada, setFixada] = useState(false);
  const [statusCanalTV, setStatusCanalTV] = useState('CONNECTING');
  const canalConectado = statusCanalTV === 'SUBSCRIBED';
  const canalControleRef = useRef(null);
  const cardsRef = useRef(cards);
  const ultimaPresencaRef = useRef(0);
  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  useEffect(() => {
    const clockInterval = setInterval(() => { 
      setHoraAtual(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })); 
    }, 1000);
    const buscarDados = async () => {
      const { data } = await supabase.from('avisos').select('*').order('id', { ascending: false });
      if (data) {
        const normais = data.filter(item => item.categoria !== 'Letreiro');
        setCards((atuais) => (
          JSON.stringify(atuais) === JSON.stringify(normais) ? atuais : normais
        ));
        setCardAtualIndex((indice) => normais.length > 0 ? indice % normais.length : 0);
        const letreiro = data.find(item => item.categoria && item.categoria.toLowerCase() === 'letreiro');
        if (letreiro) setTextoLetreiro(letreiro.descricao);
      }
    };
    buscarDados();
    const databaseInterval = setInterval(buscarDados, 5000);
    return () => { clearInterval(clockInterval); clearInterval(databaseInterval); };
  }, [supabase]);

  useEffect(() => {
    const canal = supabase.channel('canal-tv-barao', {
      config: { presence: { key: `tv-${Date.now()}-${Math.random().toString(36).slice(2)}` } },
    });
    canalControleRef.current = canal;

    canal.on('broadcast', { event: 'comando-remoto' }, ({ payload = {} }) => {
      const listaAtual = cardsRef.current;

      switch (payload.acao) {
        case 'PAUSAR':
          setPausada(true);
          break;
        case 'RETOMAR':
          setPausada(false);
          setFixada(false);
          break;
        case 'PROXIMO':
          setFixada(false);
          if (listaAtual.length > 0) {
            setCardAtualIndex((indice) => (indice + 1) % listaAtual.length);
          }
          break;
        case 'ANTERIOR':
          setFixada(false);
          if (listaAtual.length > 0) {
            setCardAtualIndex((indice) => (indice - 1 + listaAtual.length) % listaAtual.length);
          }
          break;
        case 'FIXAR':
          if (payload.slideId !== undefined && payload.slideId !== null) {
            const indice = listaAtual.findIndex((card) => String(card.id) === String(payload.slideId));
            if (indice >= 0) setCardAtualIndex(indice);
          }
          setFixada(true);
          break;
        default:
          break;
      }
    });

    canal.subscribe((status) => {
      if (canalControleRef.current !== canal) return;
      setStatusCanalTV(status);
      console.log('Status do canal de controle da TV:', status);
    });

    return () => {
      if (canalControleRef.current === canal) canalControleRef.current = null;
      supabase.removeChannel(canal);
    };
  }, [supabase]);

  useEffect(() => {
    if (cards.length <= 1 || pausada || fixada) return;
    const tempoDeExibicao = (cards[cardAtualIndex]?.duracao || 10) * 1000;
    const rotationTimeout = setTimeout(() => { 
      setCardAtualIndex((prevIndex) => (prevIndex + 1) % cards.length); 
    }, tempoDeExibicao);
    return () => clearTimeout(rotationTimeout);
  }, [cards, cardAtualIndex, pausada, fixada]);

  const cardAtivo = cards[cardAtualIndex];
  const layoutDefinido = cardAtivo?.categoria || "Layout 2: Cyber Dashboard";

  useEffect(() => {
    const canal = canalControleRef.current;
    if (!canalConectado || !canal) return;

    const estado = {
      papel: 'tv',
      aviso: cardAtivo ? {
        id: cardAtivo.id,
        titulo: cardAtivo.titulo,
        descricao: cardAtivo.descricao,
        categoria: cardAtivo.categoria,
        horario: cardAtivo.horario,
        duracao: cardAtivo.duracao,
        link_fundo: cardAtivo.link_fundo,
      } : null,
      letreiro: textoLetreiro,
      pausada,
      fixada,
      atualizadoEm: Date.now(),
    };

    const publicarEstado = () => canal.send({
      type: 'broadcast',
      event: 'estado-tv',
      payload: estado,
    }).catch((error) => {
      console.error('Erro ao publicar o estado atual da TV:', error);
    });

    publicarEstado();
    // Broadcast keeps controls responsive; Presence allows at most 5 updates per 30 seconds.
    const atrasoPresenca = Math.max(0, 10000 - (Date.now() - ultimaPresencaRef.current));
    const timeoutPresenca = setTimeout(() => {
      ultimaPresencaRef.current = Date.now();
      canal.track(estado).catch((error) => {
        console.error('Erro ao atualizar a presença da TV:', error);
      });
    }, atrasoPresenca);
    // Send a fresh snapshot to controllers that join while the TV is paused.
    const intervaloEstado = setInterval(publicarEstado, 3000);

    return () => {
      clearTimeout(timeoutPresenca);
      clearInterval(intervaloEstado);
    };
  }, [canalConectado, cardAtivo, textoLetreiro, pausada, fixada]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#060b19', color: '#f8fafc', display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100vw', height: '100vh' }}>
      
      {/* HEADER DA ESCOLA COM MEDIDAS FLUIDAS E FONTE INTEIRAMENTE UNIFICADA */}
      <div style={{ height: '7vh', minHeight: '60px', backgroundColor: '#111a36', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4vw', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          
          {/* 🌟 BRASÃO EM CÍRCULO PERFEITO COM ACABAMENTO PREMIUM */}
          <div style={{ backgroundColor: '#000000', width: '50px', height: '50px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.6)' }}>
            <img 
              src="/logo-branca.png" 
              alt="Logo PEI Barão" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              onError={(e) => {
                if (e.target.src !== window.location.origin + "/src/assets/logo-branca.png") {
                  e.target.src = "/src/assets/logo-branca.png";
                }
              }}
            />
          </div>
          <div style={{ fontSize: 'calc(14px + 0.5vw)', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#ffffff' }}>
            PEI Barão de Jundiaí
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: canalConectado ? '#00ff88' : '#94a3b8', fontSize: '10px', fontWeight: '800', letterSpacing: '1px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: canalConectado ? '#00ff88' : '#64748b' }} />
            {canalConectado ? 'CONTROLE ONLINE' : `CONTROLE ${statusCanalTV}`}
          </div>
          <div style={{ fontSize: 'calc(14px + 0.5vw)', fontWeight: '700', color: '#00d2ff', fontFamily: 'monospace', letterSpacing: '1px' }}>{horaAtual}</div>
        </div>
      </div>
      
      {/* CONTEÚDO DINÂMICO RESPONSIVO */}
      <div style={{ height: '86vh', position: 'relative', zIndex: 2, padding: '2vh 2vw', boxSizing: 'border-box' }}>
        {cardAtivo ? (
          <>
            {/* MODELO 1: SPLIT DASHBOARD (FOTO PROPORCIONAL NA DIREITA E TEXTO NA ESQUERDA) */}
            {(layoutDefinido.includes("Layout 2") || layoutDefinido.includes("Modelo 1")) && (
              <div style={{ display: 'flex', flexDirection: 'row', gap: '3vw', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box', padding: '0 2vw' }}>
                
                {/* Lado Esquerdo: Bloco de Texto (Ocupa 48% da tela) */}
                <div className="led-moldura-premium" style={{ width: '48%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '4vh 3vw', height: '90%', boxSizing: 'border-box' }}>
                  <h1 style={{ fontSize: 'calc(20px + 1vw)', fontWeight: '800' }}>{cardAtivo.titulo}</h1>
                  <div style={{ width: '60px', height: '3px', backgroundColor: '#00d2ff', margin: '2vh 0', boxShadow: '0 0 10px #00d2ff' }} />
                  <p style={{ fontSize: 'calc(14px + 0.4vw)', color: '#cbd5e1', lineHeight: '1.6', maxWidth: '90%' }}>{cardAtivo.descricao}</p>
                  {cardAtivo.horario && <div style={{ marginTop: '3vh', padding: '1vh 2vw', background: 'rgba(0,210,255,0.1)', border: '1px solid #00d2ff', borderRadius: '30px', fontSize: 'calc(12px + 0.3vw)', fontWeight: '700', color: '#00d2ff' }}>{cardAtivo.horario}</div>}
                </div>
                
                {/* Lado Direito: Container de Mídia Ampliado (Ocupa 48% da tela, sem cortes) */}
                <div style={{ width: '48%', height: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxSizing: 'border-box' }}>
                  {cardAtivo.link_fundo?.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || cardAtivo.link_fundo?.includes('video') ? (
                    <video 
                      src={cardAtivo.link_fundo} 
                      style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: '20px', border: '2px solid rgba(0, 210, 255, 0.4)', boxShadow: '0 0 25px rgba(0, 210, 255, 0.2)' }} 
                      autoPlay loop muted playsInline 
                    />
                  ) : (
                    <img 
                      src={cardAtivo.link_fundo} 
                      style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: '20px', border: '2px solid rgba(0, 210, 255, 0.4)', boxShadow: '0 0 25px rgba(0, 210, 255, 0.2)' }} 
                      alt="Mural" 
                    />
                  )}
                </div>

              </div>
            )}
            {/* MODELO 2: EDITORIAL NOBRE (TEXTO PURO CENTRALIZADO GRANDÃO) */}
            {(layoutDefinido.includes("Layout 3") || layoutDefinido.includes("Modelo 2")) && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div className="led-moldura-premium" style={{ padding: '6vh 5vw', textAlign: 'center', width: '100%', maxWidth: '900px' }}>
                  <h1 style={{ fontSize: 'calc(24px + 1.2vw)', color: '#00d2ff', marginBottom: '3vh', textTransform: 'uppercase', fontWeight: '800' }}>{cardAtivo.titulo}</h1>
                  <p style={{ fontSize: 'calc(16px + 0.5vw)', color: '#e2e8f0', lineHeight: '1.7', maxWidth: '90%', margin: '0 auto' }}>{cardAtivo.descricao}</p>
                </div>
              </div>
            )}
            {/* MODELO 3: MÍDIA PURA EM TELA CHEIA (SEM TEXTO, COM DESFOQUE DE FUNDO E CARD NEON) */}
            {(layoutDefinido.includes("Layout 4") || layoutDefinido.includes("Modelo 3")) && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '20px' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${cardAtivo.link_fundo})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(35px)', opacity: 0.3, zIndex: 1 }} />
                
                <div className="led-moldura-premium" style={{ width: '90%', height: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2, padding: '20px', background: 'rgba(11, 26, 54, 0.25)', backdropFilter: 'blur(10px)', borderRadius: '24px', border: '2px solid rgba(0, 210, 255, 0.3)', boxShadow: '0 0 35px rgba(0, 210, 255, 0.2)' }}>
                  {cardAtivo.link_fundo?.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || cardAtivo.link_fundo?.includes('video') ? (
                    <video src={cardAtivo.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '14px' }} autoPlay loop muted playsInline />
                  ) : (
                    <img src={cardAtivo.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '14px' }} alt="Mural" />
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 'calc(16px + 0.5vw)', color: '#cbd5e1' }}>
            Nenhum comunicado ativo no momento.
          </div>
        )}
      </div>

      {/* RODAPÉ DO LETREIRO DIGITAL (BLINDADO E FIXO FORA DOS LAYOUTS) */}
      <div style={{ height: '7vh', minHeight: '50px', backgroundColor: '#0f172a', borderTop: '2px solid #00d2ff', display: 'flex', alignItems: 'center', overflow: 'hidden', position: 'relative', zIndex: 10 }}>
        <div style={{ backgroundColor: '#00d2ff', color: '#0f172a', padding: '0 2vw', height: '100%', display: 'flex', alignItems: 'center', fontWeight: '800', fontSize: 'calc(12px + 0.4vw)', textTransform: 'uppercase', letterSpacing: '1px', zIndex: 2, boxShadow: '5px 0 15px rgba(0,0,0,0.3)' }}>
          Aviso
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'inline-block', whiteSpace: 'nowrap', animation: 'marquee 25s linear infinite', fontSize: 'calc(14px + 0.5vw)', fontWeight: '600', color: '#ffffff', paddingLeft: '100%' }}>
            {textoLetreiro}
          </div>
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-100%, 0, 0); }
          }
        `}</style>
      </div>

    </div>
  );
}
