import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PanelScreen({ supabase, tema, dark, setDark }) {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Layout 2: Cyber Dashboard');
  const [duracao, setDuracao] = useState('10');
  const [horario, setHorario] = useState('');
  const [linkFundo, setLinkFundo] = useState('');
  const [prioridade, setPrioridade] = useState('Normal');
  const [textoAlerta, setTextoAlerta] = useState('');
  const [avisosSalvos, setAvisosSalvos] = useState([]);
  const [letreiroAtivo, setLetreiroAtivo] = useState('Aguardando atualizações.');
  const [horaPreview, setHoraPreview] = useState('');

    useEffect(() => {
    carregarAvisosDoBanco();
    const intB = setInterval(carregarAvisosDoBanco, 4000);
    const intR = setInterval(() => setHoraPreview(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })), 1000);
    return () => { clearInterval(intB); clearInterval(intR); };
  }, []);

  const carregarAvisosDoBanco = async () => {
    const { data } = await supabase.from('avisos').select('*').order('id', { ascending: false });
    if (data) {
      setAvisosSalvos(data.filter(item => item.categoria !== 'Letreiro'));
      const letreiro = data.find(item => item.categoria === 'Letreiro');
      if (letreiro) setLetreiroAtivo(letreiro.descricao);
    }
  };

  const handlePublicarAviso = async (e) => {
    e.preventDefault();
    if (!titulo || !descricao) return alert("Preencha o Título e a Descrição!");
    const { error } = await supabase.from('avisos').insert([{ titulo, descricao, categoria, duracao: parseInt(duracao), horario, link_fundo: linkFundo }]);
    if (!error) { setTitulo(''); setDescricao(''); setHorario(''); setLinkFundo(''); carregarAvisosDoBanco(); }
  };

  const handlePublicarLetreiro = async (e) => {
    e.preventDefault();
    if (!textoAlerta) return;
    const { error } = await supabase.from('avisos').insert([{ titulo: 'LETREIRO_URGENTE', descricao: textoAlerta, categoria: 'Letreiro', duracao: 0 }]);
    if (!error) { setTextoAlerta(''); carregarAvisosDoBanco(); }
  };

  const handleDeletarAviso = async (id) => {
    const { error } = await supabase.from('avisos').delete().eq('id', id);
    if (!error) carregarAvisosDoBanco();
  };

  const cardParaPreview = avisosSalvos.length > 0 ? avisosSalvos[0] : null;

    return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#060b19', color: '#f8fafc', padding: '24px', gap: '24px', boxSizing: 'border-box' }}>
      
      {/* MENU LATERAL */}
      <div className="cyber-painel-card" style={{ width: '240px', padding: '32px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px', marginBottom: '24px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>PEI BARAO DE JUNDIAI</div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '12px 14px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#ffffff', borderRadius: '10px', fontWeight: '700', fontSize: '13px' }}>Central de Controle</li>
            <li onClick={() => navigate('/tv')} style={{ padding: '12px 14px', color: '#94a3b8', borderRadius: '10px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Monitor da TV</li>
          </ul>
        </div>
        <button onClick={() => navigate('/')} style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Sair</button>
      </div>

      {/* ÁREA CENTRAL */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="cyber-painel-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px' }}>
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: '#ffffff' }}>Central de Transmissão</h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>Gerencie as telas em tempo real</p>
          </div>
          <button onClick={() => setDark(!dark)} style={{ padding: '10px 20px', backgroundColor: '#ffffff', color: '#060b19', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Alternar Tema</button>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <div className="cyber-painel-card" style={{ flex: 1, padding: '20px', textAlign: 'left' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 6px 0' }}>Slides Ativos</p>
            <p style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#ffffff' }}>{avisosSalvos.length} cards</p>
          </div>
          <div className="cyber-painel-card" style={{ flex: 2, padding: '20px', textAlign: 'left' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 6px 0' }}>Letreiro de Rodapé</p>
            <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{letreiroAtivo}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>

          <form onSubmit={handlePublicarAviso} className="cyber-painel-card" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', margin: '0 0 20px 0', textTransform: 'uppercase', textAlign: 'left' }}>Novo Comunicado</h2>
            
            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>Título do Slide</label>
              <input type="text" className="cyber-input-premium" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Reunião de Pais" />
            </div>
            
            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>Texto Informativo</label>
              <textarea className="cyber-input-premium" style={{ height: '60px', resize: 'none' }} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Detalhes..." />
            </div>
            
            <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>Horário / Vigência</label>
                <input type="text" className="cyber-input-premium" value={horario} onChange={(e) => setHorario(e.target.value)} placeholder="Ex: 07h às 12h" />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>Tempo na TV (seg)</label>
                <input type="number" className="cyber-input-premium" value={duracao} onChange={(e) => setDuracao(e.target.value)} />
              </div>
            </div>
            
            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Escolha o Layout da TV</label>
              <select className="cyber-input-premium" style={{ fontWeight: '600' }} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="Layout 1: Foto Inteira">Modelo 1: Foto em Tela Cheia (Com Vidro)</option>
                <option value="Layout 2: Cyber Dashboard">Modelo 2: Dividido com LED (Foto na Direita)</option>
                <option value="Layout 3: Minimalista Sem Foto">Modelo 3: Apenas Texto Sóbrio (Sem Imagem)</option>
                <option value="Layout 4: Alerta Critico">Modelo 4: Alerta Oficial (Borda Dupla Branca)</option>
                <option value="Layout 5: Revista (Foto Esquerda)">Modelo 5: Invertido Premium (Foto na Esquerda)</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>Enviar Foto do Computador (Fundo da TV)</label>
                            <input type="file" accept="image/*" className="cyber-input-premium" onChange={async (e) => {
                const listaArquivos = e.target.files;
                if (!listaArquivos || listaArquivos.length === 0) return;
                const arquivoSelecionado = listaArquivos[0];
                const nomeUnico = `${Date.now()}_${arquivoSelecionado.name}`;
                
                const { error } = await supabase.storage.from('imagens-mural').upload(nomeUnico, arquivoSelecionado);
                
                if (error) {
                  alert("Erro ao enviar imagem: " + error.message);
                } else {
                  const { data } = supabase.storage.from('imagens-mural').getPublicUrl(nomeUnico);
                  if (data && data.publicUrl) {
                    setLinkFundo(data.publicUrl);
                    alert("Foto enviada com sucesso! Pronto para transmitir.");
                  }
                }
             }} />

            </div>
            
            <button type="submit" style={{ width: '100%', padding: '14px', border: 'none', borderRadius: '10px', color: '#060b19', fontSize: '14px', fontWeight: '800', backgroundColor: '#ffffff', cursor: 'pointer' }}>Transmitir para a TV</button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="cyber-painel-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h2 style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Monitoramento em Tempo Real</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ width: '6px', height: '6px', backgroundColor: '#ffffff', borderRadius: '50%' }} />
                  <span style={{ fontSize: '9px', fontWeight: '700', color: '#ffffff' }}>ONLINE</span>
                </div>
              </div>

              <div style={{ width: '100%', height: '170px', backgroundColor: '#060b19', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: '700', color: '#94a3b8', backgroundColor: 'rgba(17, 26, 54, 0.5)', padding: '6px 12px', zIndex: 3 }}>
                  <span style={{ color: '#ffffff' }}>PEI BARÃO DE JUNDIAÍ</span>
                  <span>{horaPreview}</span>
                </div>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.2fr 1fr', padding: '12px', gap: '12px', alignItems: 'center', zIndex: 2 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center', justifyContent: 'center', height: '100%' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', margin: 0, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cardParaPreview ? cardParaPreview[0]?.titulo : 'MURAL DIGITAL'}</h4>
                  </div>
                  <div style={{ width: '100%', height: '100%', maxHeight: '110px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#0d1527', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cardParaPreview && cardParaPreview[0]?.link_fundo ? <img src={cardParaPreview[0].link_fundo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" /> : <span style={{ fontSize: '8px', color: '#4b5563' }}>Sem Foto</span>}
                  </div>
                </div>
                <div style={{ height: '22px', backgroundColor: '#111a36', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingLeft: '45px', position: 'relative' }}>
                  <div style={{ backgroundColor: '#ffffff', color: '#0a1128', padding: '0 6px', height: '100%', display: 'flex', alignItems: 'center', fontSize: '8px', fontWeight: '800', position: 'absolute', left: 0, zIndex: 4 }}>AVISO</div>
                  <div className="letreiro-animado" style={{ fontSize: '10px', fontWeight: '600', whiteSpace: 'nowrap', color: '#ffffff' }}>{letreiroAtivo}</div>
                </div>
              </div>
            </div>

            <form onSubmit={handlePublicarLetreiro} className="cyber-painel-card" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', margin: '0 0 14px 0', textTransform: 'uppercase', textAlign: 'left' }}>Atualizar Rodapé</h2>
              <input type="text" className="cyber-input-premium" value={textoAlerta} onChange={(e) => setTextoAlerta(e.target.value)} placeholder="Texto corrido..." />
              <button type="submit" style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '10px', color: '#060b19', fontSize: '13px', fontWeight: '700', backgroundColor: '#ffffff', marginTop: '12px', cursor: 'pointer' }}>Atualizar Rodapé</button>
            </form>
          </div>
        </div>

        <div className="cyber-painel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff', margin: 0, textTransform: 'uppercase', textAlign: 'left' }}>Monitoramento de Mídias Ativas</h2>
          {avisosSalvos.length > 0 ? (
            avisosSalvos.map((item) => {
              const ehU = item.categoria && item.categoria.includes('Critico');
              return (
                <div key={item.id} className={ehU ? 'cyber-card-urgente-painel' : 'cyber-painel-card'} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', margin: '6px 0' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', margin: 0 }}>{item.titulo}</p>
                      <span style={{ fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', backgroundColor: ehU ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)', color: '#ffffff' }}>{ehU ? 'Crítico' : 'Normal'}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Exibição: {item.duracao}s | Layout: {item.categoria}</span>
                  </div>
                  <button onClick={() => handleDeletarAviso(item.id)} style={{ padding: '6px 14px', backgroundColor: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Excluir</button>
                </div>
              );
            })
          ) : (
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, padding: '10px 0', textAlign: 'center' }}>Nenhum comunicado ativo em exibição.</p>
          )}
        </div>

      </div>
    </div>
  );
}
