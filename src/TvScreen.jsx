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
      
      {/* HEADER DA ESCOLA */}
      <div style={{ height: '70px', backgroundColor: '#111a36', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
            src="/src/assets/LOGO BRANCO.png" 
            alt="Logo PEI Barão" 
            style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }} 
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />

          <div style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            PEI Barão <span className="fonte-cursiva" style={{ textTransform: 'none', color: '#00d2ff', fontSize: '22px', marginLeft: '4px' }}>de Jundiaí</span>
          </div>
        </div>
        <div style={{ fontSize: '22px', fontWeight: '700', color: '#00d2ff', fontFamily: 'monospace', letterSpacing: '1px' }}>{horaAtual}</div>
      </div>
      
      {/* CONTEÚDO DINÂMICO */}
      <div style={{ height: 'calc(100vh - 115px)', position: 'relative', zIndex: 2, padding: '20px' }}>
        {cardAtivo ? (
          <>
            {/* MODELO 1: IMAGEM/VÍDEO INTEIRA EM TELA CHEIA REAIS (GIGANTE NO MONITOR) */}
            {layoutDefinido.includes("Layout 1") && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                
                {/* Mídia real expandida ocupando 100% da área física */}
                {cardAtivo.link_fundo?.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) ? (
                  <video src={cardAtivo.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} autoPlay loop muted playsInline />
                ) : (
                  <img src={cardAtivo.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Mural" />
                )}

                {/* Caixa de vidro flutuando por cima da imagem de forma chique */}
                <div style={{ position: 'absolute', bottom: '40px', padding: '24px 40px', textAlign: 'center', maxWidth: '750px', width: '90%', background: 'rgba(6, 11, 25, 0.85)', backdropFilter: 'blur(12px)', webkitBackdropFilter: 'blur(12px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', zIndex: 5 }}>
                  <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#ffffff', margin: 0 }}>{cardAtivo.titulo}</h1>
                  {cardAtivo.descricao && (
                    <>
                      <div style={{ width: '40px', height: '2px', backgroundColor: '#00d2ff', margin: '12px auto', boxShadow: '0 0 10px #00d2ff' }} />
                      <p style={{ fontSize: '18px', color: '#e2e8f0', lineHeight: '1.5', margin: 0 }}>{cardAtivo.descricao}</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* MODELO 2: SPLIT DASHBOARD PREMIUM (IMAGEM INTEIRA NA DIREITA SEM CORTAR) */}
            {layoutDefinido.includes("Layout 2") && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', height: '100%', alignItems: 'center', padding: '10px 20px', boxSizing: 'border-box' }}>
                <div className="led-moldura-premium" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px', height: '95%' }}>
                  <h1 style={{ fontSize: '44px', fontWeight: '800' }}>{cardAtivo.titulo}</h1>
                  <div style={{ width: '60px', height: '3px', backgroundColor: '#00d2ff', margin: '20px 0', boxShadow: '0 0 10px #00d2ff' }} />
                  <p style={{ fontSize: '22px', color: '#cbd5e1', lineHeight: '1.6', maxWidth: '85%' }}>{cardAtivo.descricao}</p>
                  {cardAtivo.horario && <div style={{ marginTop: '24px', padding: '10px 24px', background: 'rgba(0,210,255,0.1)', border: '1px solid #00d2ff', borderRadius: '30px', fontSize: '16px', fontWeight: '700', color: '#00d2ff' }}>{cardAtivo.horario}</div>}
                </div>
                <div className="led-moldura-premium" style={{ height: '95%', overflow: 'hidden', backgroundColor: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cardAtivo.link_fundo?.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) ? (
                    <video src={cardAtivo.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} autoPlay loop muted playsInline />
                  ) : (
                    <img src={cardAtivo.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Mural" />
                  )}
                </div>
              </div>
            )}
            {/* MODELO 3: EDITORIAL SEM FOTO */}
            {layoutDefinido.includes("Layout 3") && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div className="led-moldura-premium" style={{ padding: '60px 50px', textAlign: 'center', width: '100%', maxWidth: '900px' }}>
                  <h1 className="fonte-cursiva" style={{ fontSize: '56px', color: '#00d2ff', marginBottom: '16px' }}>{cardAtivo.titulo}</h1>
                  <p style={{ fontSize: '26px', color: '#e2e8f0', lineHeight: '1.7', maxWidth: '85%', margin: '0 auto' }}>{cardAtivo.descricao}</p>
                </div>
              </div>
            )}

            {/* MODELO 4: EXIBIÇÃO EXCLUSIVA DE MÍDIA COM FUNDO BORRADO PREMIUM (SEM CORTES) */}
            {layoutDefinido.includes("Layout 4") && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '20px' }}>
                
                {/* 🌌 CAMADA 1: FUNDO ESTICADO E BORRADO PARA ELIMINAR AS FAIXAS PRETAS */}
                <div style={{ position: 'absolute', inset: 0, transform: 'scale(1.1)', filter: 'blur(30px) brightness(0.4)', opacity: 0.7, zIndex: 1 }}>
                  {cardAtivo.link_fundo?.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || cardAtivo.link_fundo?.includes('video') ? (
                    <video src={cardAtivo.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay loop muted playsInline />
                  ) : (
                    <img src={cardAtivo.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Fundo Borrado" />
                  )}
                </div>

                {/* 📸 CAMADA 2: IMAGEM PRINCIPAL CENTRALIZADA, 100% INTEIRA E SEM CORTAR */}
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                  {cardAtivo.link_fundo?.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || cardAtivo.link_fundo?.includes('video') ? (
                    <video src={cardAtivo.link_fundo} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} autoPlay loop muted playsInline />
                  ) : (
                    <img src={cardAtivo.link_fundo} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="Mídia Central" />
                  )}
                </div>

              </div>
            )}

            {/* MODELO 5: REVISTA PREMIUM (IMAGEM INTEIRA NA ESQUERDA SEM CORTAR) */}
            {layoutDefinido.includes("Layout 5") && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px', height: '100%', alignItems: 'center', padding: '10px 20px', boxSizing: 'border-box' }}>
                <div className="led-moldura-premium" style={{ height: '95%', overflow: 'hidden', backgroundColor: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cardAtivo.link_fundo?.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) ? (
                    <video src={cardAtivo.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} autoPlay loop muted playsInline />
                  ) : (
                    <img src={cardAtivo.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Mural" />
                  )}
                </div>
                <div className="led-moldura-premium" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px', height: '95%' }}>
                  <h1 style={{ fontSize: '44px', fontWeight: '800' }}>{cardAtivo.titulo}</h1>
                  <div style={{ width: '60px', height: '3px', backgroundColor: '#00d2ff', margin: '20px 0', boxShadow: '0 0 10px #00d2ff' }} />
                  <p style={{ fontSize: '22px', color: '#cbd5e1', lineHeight: '1.6', maxWidth: '85%' }}>{cardAtivo.descricao}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div className="led-moldura-premium" style={{ padding: '40px 60px', color: 'var(--texto-secundario)', fontSize: '18px', fontWeight: '600' }}>Aguardando novos informativos da PEI Barão</div>
          </div>
        )}
      </div>

      {/* FOOTER LETREIRO DESTRAVADO */}
      <div style={{ height: '45px', backgroundColor: '#111a36', display: 'flex', alignItems: 'center', position: 'absolute', bottom: 0, left: 0, right: 0, overflow: 'hidden', borderTop: '1px solid rgba(255, 255, 255, 0.08)', zIndex: 10 }}>
        <div style={{ backgroundColor: '#00d2ff', color: '#060b19', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '800', zIndex: 12, position: 'absolute', left: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Aviso</div>
        <div style={{ display: 'flex', width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', paddingLeft: '90px' }}><span className="letreiro-fluxo" style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', display: 'inline-block' }}>{textoLetreiro}</span></div>
      </div>
    </div>
  );
}
