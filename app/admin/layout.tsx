'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    // Verificar autenticação
    const verificarAuth = () => {
      try {
        const auth = localStorage.getItem('gzox_admin_auth');
        const timestamp = localStorage.getItem('gzox_admin_timestamp');
        
        // Se não está autenticado, redireciona para login
        if (!auth || auth !== 'true') {
          console.log('❌ Não autenticado - redirecionando para login');
          router.push('/login');
          return;
        }

        // Verificar se a sessão não expirou (24 horas)
        if (timestamp) {
          const agora = Date.now();
          const tempoDecorrido = agora - parseInt(timestamp);
          const tempoExpiracao = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
          
          if (tempoDecorrido > tempoExpiracao) {
            console.log('⏰ Sessão expirada - redirecionando para login');
            localStorage.removeItem('gzox_admin_auth');
            localStorage.removeItem('gzox_admin_timestamp');
            router.push('/login');
            return;
          }
        }

        // Autenticado e sessão válida
        console.log('✅ Autenticado com sucesso');
        setVerificando(false);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.push('/login');
      }
    };

    verificarAuth();
  }, [router]);

  // Mostrar loading enquanto verifica
  if (verificando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-orange-500" size={48} />
          <p className="text-xl text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}