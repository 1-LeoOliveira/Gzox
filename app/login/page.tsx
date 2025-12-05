'use client'
import { useState, KeyboardEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function LoginAdmin() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Verificar se já está logado
  useEffect(() => {
    const auth = localStorage.getItem('gzox_admin_auth');
    if (auth === 'true') {
      console.log('✅ Já autenticado - redirecionando para admin');
      router.push('/admin');
    }
  }, [router]);

  const handleLogin = () => {
    setErro('');

    // Validação básica
    if (!usuario.trim() || !senha.trim()) {
      setErro('Preencha todos os campos');
      return;
    }

    setCarregando(true);

    // Simulando verificação (você pode substituir por autenticação real)
    setTimeout(() => {
      if (usuario === 'admin' && senha === 'gzox2025') {
        // Salvar autenticação no localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('gzox_admin_auth', 'true');
          localStorage.setItem('gzox_admin_timestamp', Date.now().toString());
          console.log('✅ Login realizado com sucesso!');
        }
        // Redirecionar para o painel admin usando Next.js router
        router.push('/admin');
      } else {
        setErro('Usuário ou senha incorretos');
        setCarregando(false);
      }
    }, 800);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 flex items-center justify-center p-4">
      {/* Padrão decorativo de fundo */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.4) 0%, transparent 50%),
                         radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.4) 0%, transparent 50%),
                         radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)`
      }} />

      {/* Card de Login */}
      <div className="relative w-full max-w-md">
        {/* Botão Voltar */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-white hover:text-orange-100 transition-colors mb-4 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg"
        >
          <ArrowLeft size={20} />
          <span>Voltar para o formulário</span>
        </a>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-orange-200">
          {/* Logo/Ícone */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-32 h-32 mb-4 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center shadow-2xl">
              {/* Logo da empresa - substitua /logo.png pelo caminho real da sua logo */}
              <img
                src="/logo.png"
                alt="G'ZOX Logo"
                className="w-24 h-24 object-contain drop-shadow-xl"
                onError={(e) => {
                  // Fallback caso a logo não carregue
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) (fallback as HTMLElement).style.display = 'flex';
                }}
              />
              {/* Fallback caso a logo não exista */}
              <div className="hidden absolute inset-0 flex items-center justify-center">
                <Star className="text-orange-500" size={48} />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Painel Administrativo</h1>
            <p className="text-orange-600 text-sm mt-1">G'ZOX - Sistema de Avaliações</p>
          </div>

          {/* Formulário */}
          <div className="space-y-5">
            {/* Campo Usuário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-orange-500" size={20} />
                </div>
                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite seu usuário"
                  disabled={carregando}
                  className="w-full pl-10 pr-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-orange-500" size={20} />
                </div>
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua senha"
                  disabled={carregando}
                  className="w-full pl-10 pr-12 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  disabled={carregando}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-orange-600 hover:text-orange-800 disabled:opacity-50"
                >
                  {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Mensagem de Erro */}
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                {erro}
              </div>
            )}

            {/* Botão de Login */}
            <button
              onClick={handleLogin}
              disabled={carregando}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all shadow-lg ${
                carregando
                  ? 'bg-orange-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 hover:shadow-xl hover:scale-[1.02]'
              }`}
            >
              {carregando ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Entrando...
                </span>
              ) : (
                'Entrar no Painel'
              )}
            </button>
          </div>

          {/* Informação de Segurança */}
          <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
            <p className="text-xs text-orange-700 text-center">
              🔒 <strong>Área Restrita</strong><br />
              Acesso apenas para administradores autorizados
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-white mt-6 drop-shadow-lg">
          © 2025 G'ZOX - Sistema de Gestão de Avaliações
        </p>
      </div>
    </div>
  );
}