import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

import LoginScreen from './LoginScreen';
import PanelScreen from './PanelScreen';
import TvScreen from './TvScreen';

// ==========================================
// ⚠️ INSIRA AS SUAS DUAS CHAVES DO SUPABASE ABAIXO
// ==========================================
const SUPABASE_URL = "https://hvfznilryscauyfgxkrd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_QNNPntR5_EkynmSdfzf-6g_d--GXAdU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const temas = {
  claro: { bgGeral: '#f1f5f9', bgCard: '#ffffff', textoPrincipal: '#0f172a', textoSecundario: '#64748b', borda: '#e2e8f0', inputBg: '#ffffff', sombra: '0 10px 30px rgba(0,0,0,0.05)' },
  escuro: { bgGeral: '#0b0f19', bgCard: '#1e293b', textoPrincipal: '#f8fafc', textoSecundario: '#94a3b8', borda: '#334155', inputBg: '#090d16', sombra: '0 20px 40px rgba(0,0,0,0.4)' }
};

const stylesConst = {
  loginContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#090d16', padding: '20px' },
  loginCard: { width: '100%', maxWidth: '380px', backgroundColor: '#ffffff', borderRadius: '8px', padding: '40px 30px', boxShadow: '0 20px 25px rgba(0,0,0,0.3)', border: '1px solid #1e293b' },
  loginTitle: { fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' },
  loginSubtitle: { fontSize: '12px', color: '#0284c7', marginBottom: '30px', fontWeight: '600', textTransform: 'uppercase' },
  inputGroup: { marginBottom: '20px', textAlign: 'left' },
  label: { display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' },
  button: { width: '100%', padding: '12px', border: 'none', borderRadius: '6px', color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  miniTvWindow: { width: '100%', height: '170px', backgroundColor: '#090d16', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', position: 'relative' },
  tvContainer: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#020617', display: 'flex', flexDirection: 'column' },
  tvHeader: { height: '80px', backgroundColor: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 50px', zIndex: 10, borderBottom: '1px solid #1e293b' },
  tvLogoArea: { fontSize: '22px', fontWeight: '700', color: '#f8fafc' },
  tvWidgetsArea: { display: 'flex', alignItems: 'center', gap: '40px', color: '#ffffff' },
  tvWeather: { fontSize: '20px', color: '#94a3b8' },
  tvClockArea: { fontSize: '24px', fontWeight: '700', fontFamily: 'monospace' },
  tvMainContent: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px', backgroundSize: 'cover', backgroundPosition: 'center' },
  tvNewsMeta: { fontSize: '13px', fontWeight: '600', color: '#38bdf8', textTransform: 'uppercase' },
  tvNewsTitle: { fontSize: '40px', fontWeight: '700', margin: 0, color: '#ffffff' },
  tvNewsDesc: { fontSize: '20px', lineHeight: '1.6', color: '#cbd5e1' },
  tvTicker: { height: '60px', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', borderTop: '1px solid #1e293b' },
  tvTickerLabel: { backgroundColor: '#991b1b', color: '#ffffff', padding: '0 25px', height: '100%', display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '700', zIndex: 10, position: 'absolute', left: 0 },
  tvTickerWrapper: { display: 'flex', width: '100%', overflow: 'hidden' },
  tvTickerText: { fontSize: '18px', whiteSpace: 'nowrap', color: '#f1f5f9' }
};

export default function App() {
  const [dark, setDark] = useState(true);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginScreen supabase={supabase} styles={stylesConst} tema={dark ? temas.escuro : temas.claro} />} />
        <Route path="/panel" element={<PanelScreen supabase={supabase} styles={stylesConst} tema={dark ? temas.escuro : temas.claro} dark={dark} setDark={setDark} />} />
        <Route path="/tv" element={<TvScreen supabase={supabase} styles={stylesConst} />} />
      </Routes>
    </BrowserRouter>
  );
}
