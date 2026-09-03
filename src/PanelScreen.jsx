import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PanelScreen({ supabase, dark, setDark }) {
  const navigate = useNavigate();
  
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Layout 2: Cyber Dashboard');
  const [duracao, setDuracao] = useState('10');
  const [horario, setHorario] = useState('');
  const [linkFundo, setLinkFundo] = useState('');
  const [textoAlerta, setTextoAlerta] = useState('');
  const [avisosSalvos, setAvisosSalvos] = useState([]);
  const [letreiroAtivo, setLetreiroAtivo] = useState('Painel Executivo Barão de Jundiaí');
  const [horaPreview, setHoraPreview] = useState('');
  useEffect(() => {
    document.body.className = dark ? '' : 'light-mode';
    buscarDados();
    const intervalBanco = setInterval(buscarDados, 4000);
    const intervalRelogio = setInterval(() => {
      setHoraPreview(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => { clearInterval(intervalBanco); clearInterval(intervalRelogio); };
  }, [dark]);

  const buscarDados = async () => {
    const { data } = await supabase.from('avisos').select('*').order('id', { ascending: false });
    if (data) {
      setAvisosSalvos(data.filter(item => item.categoria !== 'Letreiro'));
      const letreiro = data.find(item => item.categoria && item.categoria.toLowerCase() === 'letreiro');
      if (letreiro) setLetreiroAtivo(letreiro.descricao);
    }
  };

  const handleDeletar = async (id) => {
    await supabase.from('avisos').delete().eq('id', id);
    buscarDados();
  };

  const handleTransmitir = async (e) => {
    e.preventDefault();
        if (!categoria.includes("Layout 4") && (!titulo || !descricao)) {
      return alert("Por favor, preencha o título e a descrição.");
    }
    const { error } = await supabase.from('avisos').insert([{
      titulo, descricao, categoria, duracao: parseInt(duracao), horario, link_fundo: linkFundo
    }]);
    if (!error) { setTitulo(''); setDescricao(''); setHorario(''); setLinkFundo(''); buscarDados(); alert("Transmitido com sucesso!"); }
  };

  const handleLetreiro = async (e) => {
    e.preventDefault();
    if (!textoAlerta) return;
    await supabase.from('avisos').insert([{ titulo: 'LETREIRO', descricao: textoAlerta, categoria: 'Letreiro', duracao: 0 }]);
    setTextoAlerta('');
    buscarDados();
    alert("Letreiro updated!");
  };

  const cardParaPreview = avisosSalvos.length > 0 ? avisosSalvos[0] : null;
  return (
    <div className="surgir-suave" style={{ display: 'flex', minHeight: '100vh', padding: '32px', gap: '32px', boxSizing: 'border-box' }}>
      
      {/* 🧭 NAV LATERAL CHIQUE */}
      <div className="led-moldura-premium" style={{ width: '280px', padding: '40px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
                    <div style={{ textAlign: 'left', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '0.5px', color: '#ffffff', textTransform: 'uppercase', margin: 0 }}>
              PEI Barão
            </h2>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginTop: '2px', textTransform: 'none' }}>
              DE JUNDIAÍ
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '14px 16px', background: 'var(--neon-fluxo)', color: '#060b19', borderRadius: '14px', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 15px var(--neon-sombra)' }}>Central de Controle</div>
            <div onClick={() => navigate('/tv')} style={{ padding: '14px 16px', color: 'var(--texto-secundario)', borderRadius: '14px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Abrir Tela da TV</div>
          </div>
        </div>

        <div>
          <button type="button" onClick={() => setDark(!dark)} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-premium)', borderRadius: '12px', background: 'transparent', color: 'var(--texto-principal)', fontWeight: '700', fontSize: '13px', cursor: 'pointer', marginBottom: '16px' }}>
            {dark ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
          </button>
          <button type="button" onClick={() => navigate('/')} style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>Desconectar</button>
        </div>
      </div>

      {/* 🏙️ CONTAINER PRINCIPAL */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* TOPO DE CRIAÇÃO */}
        <div className="led-moldura-premium" style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Mural de Transmissão</h1>
            <p className="fonte-cursiva" style={{ fontSize: '16px', color: 'var(--texto-secundario)' }}>Crie layouts espetaculares em tempo real</p>
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--neon-fluxo)', fontFamily: 'monospace' }}>SISTEMA ATIVO</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
          <form onSubmit={handleTransmitir} className="led-moldura-premium" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'left', color: 'var(--neon-fluxo)' }}>Novo Comunicado</h3>
            
            <div style={{ textAlign: 'left' }}><label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--texto-secundario)', display: 'block', marginBottom: '6px' }}>Título do Comunicado</label><input type="text" className="input-chique" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Feira de Ciências" /></div>
            <div style={{ textAlign: 'left' }}><label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--texto-secundario)', display: 'block', marginBottom: '6px' }}>Descrição do Aviso</label><textarea className="input-chique" style={{ height: '70px', resize: 'none' }} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Escreva os detalhes aqui..." /></div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, textAlign: 'left' }}><label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--texto-secundario)', display: 'block', marginBottom: '6px' }}>Horário / Evento</label><input type="text" className="input-chique" value={horario} onChange={(e) => setHorario(e.target.value)} placeholder="Ex: 08:00h" /></div>
              <div style={{ flex: 1, textAlign: 'left' }}><label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--texto-secundario)', display: 'block', marginBottom: '6px' }}>Duração na TV (seg)</label><input type="number" className="input-chique" value={duracao} onChange={(e) => setDuracao(e.target.value)} /></div>
            </div>

           <div style={{ textAlign: 'left' }}><label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--texto-secundario)', display: 'block', marginBottom: '6px' }}>Modelo do Layout</label><select className="input-chique" style={{ fontWeight: '700', backgroundColor: '#090f21', color: '#00d2ff', borderColor: 'rgba(0, 210, 255, 0.3)', textShadow: '0 0 8px rgba(0, 210, 255, 0.5)', cursor: 'pointer' }} value={categoria} onChange={(e) => setCategoria(e.target.value)}><option value="Layout 1: Foto Inteira" style={{ backgroundColor: '#090f21', color: '#ffffff' }}>Modelo 1: Imagem Inteira em Tela Cheia</option><option value="Layout 2: Cyber Dashboard" style={{ backgroundColor: '#090f21', color: '#00d2ff', fontWeight: '700' }}>Modelo 2: Split Dashboard (Imagem na Direita)</option><option value="Layout 3: Minimalista Sem Foto" style={{ backgroundColor: '#090f21', color: '#ffffff' }}>Modelo 3: Editorial Nobre (Apenas Texto)</option><option value="Layout 4: Alerta Critico" style={{ backgroundColor: '#090f21', color: '#ffffff' }}>Modelo 4: Foto/Vídeo Puro em Tela Cheia (Sem Textos)</option><option value="Layout 5: Revista (Foto Esquerda)" style={{ backgroundColor: '#090f21', color: '#ffffff' }}>Modelo 5: Revista Class (Imagem na Esquerda)</option></select></div>

            <div style={{ textAlign: 'left' }}><label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--texto-secundario)', display: 'block', marginBottom: '6px' }}>Anexar Mídia (Foto ou Vídeo .mp4)</label><input type="file" accept="*/*" className="input-chique" onChange={async (e) => { const files = e.target.files; if (!files || files.length === 0) return; const name = `${Date.now()}_${files.name}`; const { error } = await supabase.storage.from('imagens-mural').upload(name, files); if (!error) { const { data } = supabase.storage.from('imagens-mural').getPublicUrl(name); setLinkFundo(data.publicUrl); alert("Mídia vinculada com sucesso!"); } }} /></div>
            
            <button type="submit" style={{ width: '100%', padding: '16px', border: 'none', borderRadius: '12px', background: 'var(--texto-principal)', color: 'var(--bg-principal)', fontSize: '14px', fontWeight: '800', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>Transmitir para a TV</button>
          </form>
            
            {/* 👑 TELA DE BOAS-VINDAS INSTITUCIONAL E DATA EM TEMPO REAL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="led-moldura-premium" style={{ padding: '32px 24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', margin: 0 }}>Olá, Servidor!</h3>
                <p className="fonte-cursiva" style={{ fontSize: '15px', color: 'var(--neon-fluxo)', marginTop: '4px' }}>Bom trabalho na gestão escolar</p>
              </div>
              
              <div style={{ width: '100%', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '14px', border: '1px solid var(--border-premium)' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--texto-secundario)', display: 'block', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>Calendário do Sistema</span>
                <p style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', margin: 0, textTransform: 'capitalize' }}>
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(0,210,255,0.05)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(0,210,255,0.1)' }}>
                <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--neon-fluxo)', borderRadius: '50%', boxShadow: '0 0 8px var(--neon-fluxo)' }} />
                <p style={{ fontSize: '12px', color: 'var(--texto-secundario)', margin: 0, fontWeight: '500' }}>
                  O letreiro inferior da TV está configurado como: <span style={{ color: '#ffffff', fontWeight: '600' }}>{letreiroAtivo}</span>
                </p>
              </div>
            </div>
            
            {/* FORMULÁRIO DO LETREIRO INFERIOR */}
            <form onSubmit={handleLetreiro} className="led-moldura-premium" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--neon-fluxo)', marginBottom: '14px', textAlign: 'left' }}>Atualizar Rodapé</h3>
              <input type="text" className="input-chique" value={textoAlerta} onChange={(e) => setTextoAlerta(e.target.value)} placeholder="Texto corrido do letreiro..." />
              <button type="submit" style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '12px', background: 'var(--texto-principal)', color: 'var(--bg-principal)', fontSize: '13px', fontWeight: '700', marginTop: '12px', cursor: 'pointer' }}>Atualizar</button>
            </form>
          </div>
        </div>

        {/* 📋 MONITOR DE MÍDIAS ATIVAS */}
        <div className="led-moldura-premium" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--neon-fluxo)', textAlign: 'left' }}>Gerenciador de Mídias Ativas</h3>
          {avisosSalvos.length > 0 ? (
            avisosSalvos.map((item) => (
              <div key={item.id} className="led-moldura-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'rgba(0,0,0,0.05)' }}>
                <div style={{ textAlign: 'left' }}><p style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>{item.titulo}</p><span style={{ fontSize: '12px', color: 'var(--texto-secundario)' }}>Exibição: {item.duracao}s | Modelo: {item.categoria}</span></div>
                <button type="button" onClick={() => handleDeletar(item.id)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Remover</button>
              </div>
            ))
          ) : (
            <p className="fonte-cursiva" style={{ fontSize: '15px', color: 'var(--texto-secundario)', textAlign: 'center', padding: '20px 0' }}>Nenhum comunicado ativo na TV.</p>
          )}
        </div>

      </div>
    </div>
  );
}
