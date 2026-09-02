import React, { useState, useEffect } from 'react';

export default function TvScreen({ supabase }) {
  const [horaAtual, setHoraAtual] = useState('');
  const [cards, setCards] = useState([]);
  const [cardAtualIndex, setCardAtualIndex] = useState(0);
  const [textoLetreiro, setTextoLetreiro] = useState('Painel Informativo PEI Barão de Jundiaí');

  useEffect(() => {
    const clockInterval = setInterval(() => { 
      setHoraAtual(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })); 
    }, 1000);
    
    const buscarDados = async () => {
      const { data } = await supabase.from('avisos').select('*').order('id', { ascending: false });
      if (data) {
        const normais = data.filter(item => item.categoria !== 'Letreiro');
        if (normais.length > 0) setCards(normais);
        const letreiro = data.find(item => item.categoria && item.categoria.toLowerCase() === 'letreiro');
        if (letreiro) setTextoLetreiro(letreiro.descricao);
      }
    };
    buscarDados();
    const databaseInterval = setInterval(buscarDados, 5000);
    return () => { clearInterval(clockInterval); clearInterval(databaseInterval); };
  }, [supabase]);
  useEffect(() => {
    if (cards.length <= 1) return;
    const tempoDeExibicao = (cards[cardAtualIndex]?.duracao || 10) * 1000;
    const rotationTimeout = setTimeout(() => { 
      setCardAtualIndex((prevIndex) => (prevIndex + 1) % cards.length); 
    }, tempoDeExibicao);
    return () => clearTimeout(rotationTimeout);
  }, [cards, cardAtualIndex]);

  const cardAtivo = cards[cardAtualIndex];
  const layoutDefinido = cardAtivo?.categoria || "Layout 2: Cyber Dashboard";

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
        <div style={{ fontSize: 'calc(14px + 0.5vw)', fontWeight: '700', color: '#00d2ff', fontFamily: 'monospace', letterSpacing: '1px' }}>{horaAtual}</div>
      </div>
      
      {/* CONTEÚDO DINÂMICO RESPONSIVO */}
      <div style={{ height: '86vh', position: 'relative', zIndex: 2, padding: '2vh 2vw', boxSizing: 'border-box' }}>
        {cardAtivo ? (
          <>
            {/* MODELO 1: IMAGEM/VÍDEO EM TELA CHEIA RESPONSIVA */}
            {layoutDefinido.includes("Layout 1") && (
              <div style={{ position: 'absolute', inset: '2vh', backgroundColor: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '20px' }}>
                {cardAtivo.link_fundo?.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || cardAtivo.link_fundo?.includes('video') ? (
                  <video src={cardAtivo.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} autoPlay loop muted playsInline />
                ) : (
                  <img src={cardAtivo.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Mural" />
                )}
                <div style={{ position: 'absolute', bottom: '3vh', padding: '3vh 4vw', textAlign: 'center', width: '90%', maxWidth: '800px', background: 'rgba(6, 11, 25, 0.85)', backdropFilter: 'blur(12px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
                  <h1 style={{ fontSize: 'calc(18px + 1vw)', fontWeight: '800', color: '#ffffff', margin: 0 }}>{cardAtivo.titulo}</h1>
                  {cardAtivo.descricao && <p style={{ fontSize: 'calc(13px + 0.3vw)', color: '#e2e8f0', lineHeight: '1.5', marginTop: '1.5vh', marginBottom: 0 }}>{cardAtivo.descricao}</p>}
                </div>
              </div>
            )}

            {/* MODELO 2: SPLIT DASHBOARD (IMAGEM/VÍDEO REAIS NA DIREITA) */}
            {layoutDefinido.includes("Layout 2") && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3vw', height: '100%', alignItems: 'center', boxSizing: 'border-box' }}>
                <div className="led-moldura-premium" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '4vh 3vw', height: '95%' }}>
                  <h1 style={{ fontSize: 'calc(20px + 1vw)', fontWeight: '800' }}>{cardAtivo.titulo}</h1>
                  <div style={{ width: '60px', height: '3px', backgroundColor: '#00d2ff', margin: '2vh 0', boxShadow: '0 0 10px #00d2ff' }} />
                  <p style={{ fontSize: 'calc(14px + 0.4vw)', color: '#cbd5e1', lineHeight: '1.6', maxWidth: '90%' }}>{cardAtivo.descricao}</p>
                  {cardAtivo.horario && <div style={{ marginTop: '3vh', padding: '1vh 2vw', background: 'rgba(0,210,255,0.1)', border: '1px solid #00d2ff', borderRadius: '30px', fontSize: 'calc(12px + 0.3vw)', fontWeight: '700', color: '#00d2ff' }}>{cardAtivo.horario}</div>}
                </div>
                <div className="led-moldura-premium" style={{ height: '95%', overflow: 'hidden', backgroundColor: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cardAtivo.link_fundo?.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || cardAtivo.link_fundo?.includes('video') ? (
                    <video src={cardAtivo.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} autoPlay loop muted playsInline />
                  ) : (
                    <img src={cardAtivo.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Mural" />
                  )}
                </div>
              </div>
            )}
            {/* MODELO 3: EDITORIAL NOBRE (FONTE UNIFICADA SEM CURSIVA) */}
            {layoutDefinido.includes("Layout 3") && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div className="led-moldura-premium" style={{ padding: '6vh 5vw', textAlign: 'center', width: '100%', maxWidth: '900px' }}>
                  <h1 style={{ fontSize: 'calc(24px + 1.2vw)', color: '#00d2ff', marginBottom: '3vh', textTransform: 'uppercase', fontWeight: '800' }}>{cardAtivo.titulo}</h1>
                  <p style={{ fontSize: 'calc(16px + 0.5vw)', color: '#e2e8f0', lineHeight: '1.7', maxWidth: '90%', margin: '0 auto' }}>{cardAtivo.descricao}</p>
                </div>
              </div>
            )}

            {/* MODELO 4: FOTO/VÍDEO PURO EM TELA CHEIA COM DESFOQUE PREMIUM ULTRA RESPONSIVO */}
            {layoutDefinido.includes("Layout 4") && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '20px' }}>
                {/* Camada de desfoque de fundo */}
                <div style={{ position: 'absolute', inset: 0, transform: 'scale(1.1)', filter: 'blur(30px) brightness(0.4)', opacity: 0.7, zIndex: 1 }}>
                  {cardAtivo.link_fundo?.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || cardAtivo.link_fundo?.includes('video') ? (
                    <video src={cardAtivo.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay loop muted playsInline />
                  ) : (
                    <img src={cardAtivo.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Fundo Borrado" />
                  )}
                </div>
                {/* Mídia centralizada proporcional */}
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                  {cardAtivo.link_fundo?.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || cardAtivo.link_fundo?.includes('video') ? (
                    <video src={cardAtivo.link_fundo} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} autoPlay loop muted playsInline />
                  ) : (
                    <img src={cardAtivo.link_fundo} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="Mídia Central" />
                  )}
                </div>
              </div>
            )}
            {/* MODELO 3: EDITORIAL NOBRE (FONTE UNIFICADA SEM CURSIVA) */}
            {layoutDefinido.includes("Layout 3") && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div className="led-moldura-premium" style={{ padding: '6vh 5vw', textAlign: 'center', width: '100%', maxWidth: '900px' }}>
                  <h1 style={{ fontSize: 'calc(24px + 1.2vw)', color: '#00d2ff', marginBottom: '3vh', textTransform: 'uppercase', fontWeight: '800' }}>{cardAtivo.titulo}</h1>
                  <p style={{ fontSize: 'calc(16px + 0.5vw)', color: '#e2e8f0', lineHeight: '1.7', maxWidth: '90%', margin: '0 auto' }}>{cardAtivo.descricao}</p>
                </div>
              </div>
            )}

            {/* MODELO 4: FOTO/VÍDEO PURO EM TELA CHEIA COM DESFOQUE PREMIUM ULTRA RESPONSIVO */}
            {layoutDefinido.includes("Layout 4") && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '20px' }}>
                {/* Camada de desfoque de fundo */}
                <div style={{ position: 'absolute', inset: 0, transform: 'scale(1.1)', filter: 'blur(30px) brightness(0.4)', opacity: 0.7, zIndex: 1 }}>
                  {cardAtivo.link_fundo?.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || cardAtivo.link_fundo?.includes('video') ? (
                    <video src={cardAtivo.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay loop muted playsInline />
                  ) : (
                    <img src={cardAtivo.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Fundo Borrado" />
                  )}
                </div>
                {/* Mídia centralizada proporcional */}
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                  {cardAtivo.link_fundo?.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || cardAtivo.link_fundo?.includes('video') ? (
                    <video src={cardAtivo.link_fundo} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} autoPlay loop muted playsInline />
                  ) : (
                    <img src={cardAtivo.link_fundo} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="Mídia Central" />
                  )}
                </div>
              </div>
            )}
            {/* MODELO 5: REVISTA CLASS (IMAGEM INTEIRA NA ESQUERDA) */}
            {layoutDefinido.includes("Layout 5") && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '3vw', height: '100%', alignItems: 'center', boxSizing: 'border-box' }}>
                <div className="led-moldura-premium" style={{ height: '95%', overflow: 'hidden', backgroundColor: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cardAtivo.link_fundo?.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || cardAtivo.link_fundo?.includes('video') ? (
                    <video src={cardAtivo.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} autoPlay loop muted playsInline />
                  ) : (
                    <img src={cardAtivo.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Mural" />
                  )}
                </div>
                <div className="led-moldura-premium" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '4vh 3vw', height: '95%' }}>
                  <h1 style={{ fontSize: 'calc(20px + 1vw)', fontWeight: '800' }}>{cardAtivo.titulo}</h1>
                  <div style={{ width: '60px', height: '3px', backgroundColor: '#00d2ff', margin: '20px 0', boxShadow: '0 0 10px #00d2ff' }} />
                  <p style={{ fontSize: 'calc(14px + 0.4vw)', color: '#cbd5e1', lineHeight: '1.6', maxWidth: '90%' }}>{cardAtivo.descricao}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div className="led-moldura-premium" style={{ padding: '4vh 6vw', color: 'var(--texto-secundario)', fontSize: 'calc(14px + 0.3vw)', fontWeight: '600' }}>Aguardando novos informativos da PEI Barão</div>
          </div>
        )}
      </div>

      {/* FOOTER LETREIRO FLUIDO RESPONSIVO */}
      <div style={{ height: '7vh', minHeight: '45px', backgroundColor: '#111a36', display: 'flex', alignItems: 'center', position: 'absolute', bottom: 0, left: 0, right: 0, overflow: 'hidden', borderTop: '1px solid rgba(255, 255, 255, 0.08)', zIndex: 10 }}>
        <div style={{ backgroundColor: '#00d2ff', color: '#060b19', padding: '0 3vw', height: '100%', display: 'flex', alignItems: 'center', fontSize: 'calc(11px + 0.2vw)', fontWeight: '800', zIndex: 12, position: 'absolute', left: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Aviso</div>
        <div style={{ display: 'flex', width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', paddingLeft: '110px' }}><span className="letreiro-fluxo" style={{ fontSize: 'calc(13px + 0.4vw)', fontWeight: '600', color: '#ffffff', display: 'inline-block' }}>{textoLetreiro}</span></div>
      </div>
    </div>
  );
}
