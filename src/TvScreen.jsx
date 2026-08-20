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
        const letreiro = data.find(item => item.categoria === 'Letreiro');
        if (letreiro) setTextoLetreiro(letreiro.descricao);
      }
    };
    buscarDados();
    const databaseInterval = setInterval(buscarDados, 8000);
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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#060b19', color: '#f8fafc', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* 👑 CABEÇALHO INSTITUCIONAL */}
      <div style={{ height: '65px', backgroundColor: '#111a36', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #ffffff, #0044cc)', color: '#0a1128', width: '34px', height: '34px', borderRadius: '50%', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>B</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            PEI Barão de Jundiaí
          </div>
        </div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc', fontFamily: 'monospace' }}>
          {horaAtual}
        </div>
      </div>
      
      {/* 🏙️ RENDERIZADOR COM ESPAÇAMENTO MATEMÁTICO PERFEITO (SEM CORTES) */}
      <div style={{ height: 'calc(100vh - 110px)', position: 'relative', zIndex: 2, boxSizing: 'border-box' }}>
        
        {cardAtivo ? (
          <>
            {/* MODELO 1: FOTO INTEIRA EM TELA CHEIA (COM VIDRO NO MEIO) */}
            {layoutDefinido.includes("Layout 1") && (
              <div style={{ position: 'absolute', inset: 0, backgroundImage: cardAtivo.link_fundo ? `url(${cardAtivo.link_fundo})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                <div className="animacao-premium led-flow-card" style={{ padding: '40px', borderRadius: '16px', textAlign: 'center', maxWidth: '700px', width: '100%' }}>
                  <h1 style={{ fontSize: '38px', fontWeight: '800', color: '#ffffff' }}>{cardAtivo.titulo}</h1>
                  <div style={{ width: '50px', height: '2px', backgroundColor: '#ffffff', margin: '12px auto', opacity: 0.5 }} />
                  <p style={{ fontSize: '20px', color: '#cbd5e1', lineHeight: '1.5' }}>{cardAtivo.descricao}</p>
                </div>
              </div>
            )}

            {/* MODELO 2: CYBER DASHBOARD CENTRALIZADO COM LED (FOTO NA DIREITA) */}
            {layoutDefinido.includes("Layout 2") && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', padding: '20px 40px', gap: '30px', height: '100%', alignItems: 'center', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '90%' }}>
                  <div className="animacao-premium led-flow-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '30px', width: '100%', height: '100%' }}>
                    <h1 style={{ fontSize: '38px', fontWeight: '800', color: '#ffffff' }}>{cardAtivo.titulo}</h1>
                    <div style={{ width: '60px', height: '3px', backgroundColor: '#ffffff', opacity: 0.5, margin: '14px 0' }} />
                    <p style={{ fontSize: '20px', color: '#cbd5e1', lineHeight: '1.5', maxWidth: '90%' }}>{cardAtivo.descricao}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '90%' }}>
                  <div className="animacao-premium led-flow-card" style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cardAtivo.link_fundo && cardAtivo.link_fundo.trim() !== "" ? (
                      <img src={cardAtivo.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Mural" />
                    ) : (
                      <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>PEI BARÃO DE JUNDIAÍ</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MODELO 3: MINIMALISTA SÓBRIO (SEM FOTO) */}
            {layoutDefinido.includes("Layout 3") && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px' }}>
                <div className="animacao-premium led-flow-card" style={{ padding: '60px 40px', borderRadius: '24px', textAlign: 'center', width: '100%', maxWidth: '850px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <h1 style={{ fontSize: '46px', fontWeight: '800', color: '#ffffff', marginBottom: '20px' }}>{cardAtivo.titulo}</h1>
                  <p style={{ fontSize: '24px', color: '#cbd5e1', lineHeight: '1.6', maxWidth: '85%', margin: '0 auto' }}>{cardAtivo.descricao}</p>
                </div>
              </div>
            )}

            {/* MODELO 4: ALERTA OFICIAL CRÍTICO (BORDA DUPLA BRANCA) */}
            {layoutDefinido.includes("Layout 4") && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px' }}>
                <div className="animacao-premium" style={{ backgroundColor: '#1c0d12', border: '5px double #ffffff', borderRadius: '16px', padding: '40px', textAlign: 'center', maxWidth: '800px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#ffffff', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '10px' }}>COMUNICADO CRÍTICO</div>
                  <h1 style={{ fontSize: '44px', fontWeight: '800', color: '#ffffff', margin: '0 0 16px 0' }}>{cardAtivo.titulo}</h1>
                  <p style={{ fontSize: '20px', color: '#e2e8f0', lineHeight: '1.5' }}>{cardAtivo.descricao}</p>
                </div>
              </div>
            )}

            {/* MODELO 5: INVERTIDO PREMIUM (FOTO NA ESQUERDA) */}
            {layoutDefinido.includes("Layout 5") && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', padding: '20px 40px', gap: '30px', height: '100%', alignItems: 'center', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '90%' }}>
                  <div className="animacao-premium led-flow-card" style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cardAtivo.link_fundo && cardAtivo.link_fundo.trim() !== "" ? (
                      <img src={cardAtivo.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Mural" />
                    ) : (
                      <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>PEI BARÃO DE JUNDIAÍ</div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '90%' }}>
                  <div className="animacao-premium led-flow-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '30px', width: '100%', height: '100%' }}>
                    <h1 style={{ fontSize: '38px', fontWeight: '800', color: '#ffffff' }}>{cardAtivo.titulo}</h1>
                    <div style={{ width: '60px', height: '3px', backgroundColor: '#ffffff', opacity: 0.5, margin: '14px 0' }} />
                    <p style={{ fontSize: '20px', color: '#cbd5e1', lineHeight: '1.5', maxWidth: '90%' }}>{cardAtivo.descricao}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div className="animacao-premium led-flow-card" style={{ padding: '30px 50px', color: '#64748b', fontSize: '16px', fontWeight: '600' }}>Aguardando novos informativos da PEI Barão</div>
          </div>
        )}

      </div>

      {/* 🚨 RODAPÉ DO LETREIRO CORRENDO */}
      <div style={{ height: '45px', backgroundColor: '#111a36', display: 'flex', alignItems: 'center', position: 'absolute', bottom: 0, left: 0, right: 0, overflow: 'hidden', borderTop: '1px solid rgba(255, 255, 255, 0.1)', zIndex: 10 }}>
        <div style={{ backgroundColor: '#ffffff', color: '#0a1128', padding: '0 20px', height: '100%', display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '800', zIndex: 12, position: 'absolute', left: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Aviso
        </div>
        <div style={{ display: 'flex', width: '100%', overflow: 'hidden', zIndex: 11 }}>
          <span className="letreiro-animado" style={{ fontSize: '15px', fontWeight: '600', whiteSpace: 'nowrap', color: '#ffffff', letterSpacing: '0.5px' }}>
            {textoLetreiro}
          </span>
        </div>
      </div>

    </div>
  );
}
