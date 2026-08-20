import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginScreen({ supabase, tema }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [modoRegistro, setModoRegistro] = useState(false);

  const emailDevAutorizado = 'luisgc9872@gmail.com';

  const handleAutenticacao = async (e) => {
    e.preventDefault();
    if (!email || !senha) return alert("Por favor, preencha todos os campos.");

    const emailLimpo = email.trim();
    const ehEmailValido = emailLimpo.endsWith('@prof.educacao.sp.gov.br') || emailLimpo === emailDevAutorizado;

    if (!ehEmailValido) {
      return alert("Acesso negado: Painel restrito para e-mails institucionais da rede estadual.");
    }

    setCarregando(true);
    
    if (modoRegistro) {
      const { error } = await supabase.auth.signUp({ email: emailLimpo, password: senha });
      setCarregando(false);
      if (error) return alert("Erro no cadastro: " + error.message);
      alert("Cadastro realizado com sucesso. Sua senha foi registrada.");
      setModoRegistro(false); setSenha('');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: emailLimpo, password: senha });
      setCarregando(false);
      if (error) return alert("Acesso negado: Credenciais inválidas.");
      navigate('/panel');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: tema.bgGeral, padding: '20px', boxSizing: 'border-box' }}>
      <div className="animacao-surgir" style={{ width: '100%', maxWidth: '400px', backgroundColor: tema.bgCard, borderRadius: '16px', padding: '50px 40px', boxShadow: tema.sombra, border: `1px solid ${tema.borda}`, textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: tema.textoPrincipal, marginBottom: '6px', margin: 0, letterSpacing: '-1px' }}>Mural Digital</h1>
        <p style={{ fontSize: '13px', color: '#0284c7', marginBottom: '40px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>{modoRegistro ? "Criar Credenciais" : "Restrito para Servidores"}</p>
        <form onSubmit={handleAutenticacao} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: tema.textoSecundario, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>E-mail Institucional</label>
            <input type="email" style={{ width: '100%', padding: '14px 16px', border: `1px solid ${tema.borda}`, borderRadius: '10px', fontSize: '15px', color: tema.textoPrincipal, backgroundColor: tema.inputBg, boxSoring: 'border-box', outline: 'none' }} placeholder="usuario@prof.educacao.sp.gov.br" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: tema.textoSecundario, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{modoRegistro ? "Definir Nova Senha (mínimo 6 dígitos)" : "Senha"}</label>
            <input type="password" style={{ width: '100%', padding: '14px 16px', border: `1px solid ${tema.borda}`, borderRadius: '10px', fontSize: '15px', color: tema.textoPrincipal, backgroundColor: tema.inputBg, boxSizing: 'border-box', outline: 'none' }} placeholder="••••••••" required value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          <button type="submit" disabled={carregando} style={{ width: '100%', padding: '14px', border: 'none', borderRadius: '10px', color: '#ffffff', fontSize: '15px', fontWeight: '600', cursor: 'pointer', backgroundColor: '#0284c7' }}>
            {carregando ? 'Validando...' : modoRegistro ? 'Registrar Acesso' : 'Entrar no Painel'}
          </button>
        </form>
        <button onClick={() => { setModoRegistro(!modoRegistro); setSenha(''); }} style={{ background: 'none', border: 'none', color: tema.textoSecundario, marginTop: '30px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
          {modoRegistro ? "← Retornar para o login" : "Primeiro acesso? Registre-se aqui"}
        </button>
      </div>
    </div>
  );
}
