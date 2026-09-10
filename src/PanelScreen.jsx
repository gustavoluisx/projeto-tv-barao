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
  const [carregandoMidia, setCarregandoMidia] = useState(false);
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
  const handleUploadMidia = async (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    try {
      setCarregandoMidia(true);
      
      // Extrai de forma limpa a extensão correta do arquivo original (.png, .jpg, .mp4, etc)
      const extensao = arquivo.name.split('.').pop();
      const nomeUnico = `${Date.now()}_mural.${extensao}`;

      // Envia o arquivo de forma assíncrona direto para o seu bucket do Supabase Storage
      const { data, error } = await supabase.storage
        .from('imagens-mural')
        .upload(nomeUnico, arquivo, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Gera e captura a URL pública definitiva da mídia para salvar na tabela do banco
      const { data: publicUrlData } = supabase.storage
        .from('imagens-mural')
        .getPublicUrl(nomeUnico);

      setLinkFundo(publicUrlData.publicUrl);
      alert("Mídia carregada com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao fazer o upload da mídia: " + err.message);
    } finally {
      setCarregandoMidia(false);
    }
  };
  const handleDeletar = async (id) => {
    if (!confirm("Deseja realmente excluir este comunicado?")) return;
    await supabase.from('avisos').delete().eq('id', id);
    buscarDados();
  };

  const handleTransmitir = async (e) => {
    e.preventDefault();
    if (!categoria.includes("Layout 4") && (!titulo || !descricao)) {
      return alert("Por favor, preencha o título e a descrição.");
    }
    if (carregandoMidia) {
      return alert("Aguarde a mídia terminar de carregar antes de transmitir.");
    }
    
    const { error } = await supabase.from('avisos').insert([{
      titulo, descricao, categoria, duracao: parseInt(duracao), horario, link_fundo: linkFundo
    }]);
    
    if (!error) { 
      setTitulo(''); 
      setDescricao(''); 
      setHorario(''); 
      setLinkFundo(''); 
      buscarDados(); 
      alert("Transmitido com sucesso!"); 
    } else {
      alert("Erro ao transmitir comunicado: " + error.message);
    }
  };
  const handleLetreiro = async (e) => {
    e.preventDefault();
    if (!textoAlerta) return;
    await supabase.from('avisos').insert([{ titulo: 'LETREIRO', descricao: textoAlerta, categoria: 'Letreiro', duracao: 0 }]);
    setTextoAlerta('');
    buscarDados();
    alert("Letreiro atualizado!");
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
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--texto-secundario)', display: 'block', marginBottom: '6px' }}>Título do Comunicado</label>
              <input type="text" className="input-chique" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Feira de Ciências" />
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--texto-secundario)', display: 'block', marginBottom: '6px' }}>Descrição do Aviso</label>
              <textarea className="input-chique" style={{ height: '70px', resize: 'none' }} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Escreva os detalhes aqui..." />
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, textAlign: 'left' }}><label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--texto-secundario)', display: 'block', marginBottom: '6px' }}>Horário / Evento</label><input type="text" className="input-chique" value={horario} onChange={(e) => setHorario(e.target.value)} placeholder="Ex: 08:00h" /></div>
              <div style={{ flex: 1, textAlign: 'left' }}><label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--texto-secundario)', display: 'block', marginBottom: '6px' }}>Duração na TV (seg)</label><input type="number" className="input-chique" value={duracao} onChange={(e) => setDuracao(e.target.value)} /></div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--texto-secundario)', display: 'block', marginBottom: '6px' }}>Upload de Imagem ou Vídeo para a TV</label>
              <input 
                type="file" 
                className="input-chique" 
                accept="image/*, video/mp4, video/webm, video/quicktime" 
                onChange={handleUploadMidia} 
                disabled={carregandoMidia}
                style={{ cursor: 'pointer', padding: '10px' }}
              />
              {carregandoMidia && <p style={{ fontSize: '12px', color: '#00d2ff', marginTop: '5px' }}>Enviando arquivo para o servidor do Supabase...</p>}
              {linkFundo && !carregandoMidia && <p style={{ fontSize: '12px', color: '#10b981', marginTop: '5px' }}>✔ Arquivo vinculado com sucesso!</p>}
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--texto-secundario)', display: 'block', marginBottom: '6px' }}>Modelo do Layout</label>
              <select className="input-chique" style={{ fontWeight: '700', backgroundColor: '#090f21', color: '#00d2ff', borderColor: 'rgba(0, 210, 255, 0.3)', textShadow: '0 0 8px rgba(0, 210, 255, 0.5)', cursor: 'pointer' }} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="Layout 1: Foto Inteira" style={{ backgroundColor: '#090f21', color: '#ffffff' }}>Modelo 1: Imagem Inteira em Tela Cheia</option>
                <option value="Layout 2: Cyber Dashboard" style={{ backgroundColor: '#090f21', color: '#00d2ff', fontWeight: '700' }}>Modelo 2: Split Dashboard</option>
                <option value="Layout 3: Editorial Nobre" style={{ backgroundColor: '#090f21', color: '#ffffff' }}>Modelo 3: Apenas Texto / Editorial</option>
                <option value="Layout 4: Foto Puro" style={{ backgroundColor: '#090f21', color: '#ffffff' }}>Modelo 4: Mídia Pura sem Texto</option>
              </select>
            </div>

            <button type="submit" className="botao-transmissao" disabled={carregandoMidia} style={{ width: '100%', padding: '16px', border: 'none', borderRadius: '12px', background: 'var(--neon-fluxo)', color: '#060b19', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 15px var(--neon-sombra)', opacity: carregandoMidia ? 0.6 : 1 }}>
              {carregandoMidia ? 'Enviando arquivo...' : 'Transmitir para o Painel'}
            </button>
          </form>
          {/* SEÇÃO DA DIREITA: PREVIEW EM TEMPO REAL E ATUALIZAR LETREIRO */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="led-moldura-premium" style={{ padding: '24px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--texto-secundario)' }}>Preview da TV</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--texto-secundario)' }}>{horaPreview}</span>
              </div>
              <div style={{ height: '180px', backgroundColor: '#060b19', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                {cardParaPreview ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '12px', boxSizing: 'border-box' }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>PEI BARÃO DE JUNDIAÍ</div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {cardParaPreview.link_fundo ? (
                        cardParaPreview.link_fundo.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || cardParaPreview.link_fundo.includes('video') ? (
                          <video src={cardParaPreview.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay loop muted playsInline />
                        ) : (
                          <img src={cardParaPreview.link_fundo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Mídia" />
                        )
                      ) : (
                        <div style={{ fontSize: '11px', color: 'var(--texto-secundario)', fontStyle: 'italic' }}>Sem mídia ativa</div>
                      )}
                    </div>
                    <div style={{ background: '#00d2ff', color: '#060b19', padding: '3px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', alignSelf: 'flex-start' }}>{cardParaPreview.titulo || 'SEM TÍTULO'}</div>
                  </div>
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--texto-secundario)', fontStyle: 'italic' }}>Nenhum comunicado ativo</span>
                )}
              </div>
            </div>

            <form onSubmit={handleLetreiro} className="led-moldura-premium" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--neon-fluxo)', margin: 0 }}>Atualizar Rodapé</h3>
              <input type="text" className="input-chique" value={textoAlerta} onChange={(e) => setTextoAlerta(e.target.value)} placeholder="Escreva a mensagem do letreiro de rolagem..." />
              <button type="submit" style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '10px', background: 'rgba(0,210,255,0.1)', color: '#00d2ff', border: '1px solid #00d2ff', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>Atualizar Letreiro</button>
            </form>
          </div>
        </div>

        {/* LISTA DE AVISOS REMOVÍVEIS */}
        <div className="led-moldura-premium" style={{ padding: '24px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--texto-secundario)', marginBottom: '16px' }}>Comunicados Agendados no Sistema</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
            {avisosSalvos.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-premium)', borderRadius: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', margin: 0, color: '#ffffff' }}>{item.titulo}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--texto-secundario)', margin: '4px 0 0 0' }}>{item.categoria} • {item.duracao} segundos</p>
                </div>
                <button type="button" onClick={() => handleDeletar(item.id)} style={{ padding: '8px 14px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Excluir</button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
