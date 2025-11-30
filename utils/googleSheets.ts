// utils/googleSheets.ts - Enviar dados do formulário para Google Sheets

export interface FormData {
  store: string;
  name: string;
  phone: string;
  email: string;
  plate: string;
  serviceRating: number;
  recommendationRating: number;
}

export interface SheetResponse {
  success: boolean;
  message: string;
}

// URL do Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxinsLcVumXrKtFI4qts0rudse8K6akYr-on0zRWAtVh-Bw6I9g_ibJEFd1YV4JwWHI/exec';

/**
 * Envia os dados do formulário para o Google Sheets
 */
export async function enviarParaGoogleSheets(formData: FormData): Promise<SheetResponse> {
  try {
    console.log('[GoogleSheets] 📤 Enviando dados para planilha...');
    console.log('[GoogleSheets] 📋 Dados:', formData);

    const payload = {
      ...formData,
      timestamp: new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };

    console.log('[GoogleSheets] 📦 Payload preparado:', payload);

    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain', // Mudança importante para evitar CORS preflight
      },
      body: JSON.stringify(payload)
    });

    console.log('[GoogleSheets] 📡 Status da resposta:', response.status);
    
    // Tentar ler a resposta
    const responseText = await response.text();
    console.log('[GoogleSheets] 📄 Resposta:', responseText);
    
    try {
      const result = JSON.parse(responseText);
      return {
        success: result.success || true,
        message: result.message || 'Dados enviados com sucesso!'
      };
    } catch {
      // Se não conseguir parsear, assume sucesso
      return {
        success: true,
        message: 'Dados enviados com sucesso!'
      };
    }

  } catch (error) {
    console.error('[GoogleSheets] ❌ Erro ao enviar dados:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido ao enviar dados'
    };
  }
}

/**
 * Testa a conexão com a API do Google Sheets
 */
export async function testarConexao(): Promise<boolean> {
  try {
    console.log('[GoogleSheets] 🧪 Testando conexão...');
    
    const response = await fetch(SCRIPT_URL, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[GoogleSheets] ✅ Conexão OK:', data);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[GoogleSheets] ❌ Erro na conexão:', error);
    return false;
  }
}

/**
 * Valida os dados do formulário antes de enviar
 */
export function validarFormulario(formData: FormData): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  if (!formData.store) {
    erros.push('Loja não selecionada');
  }

  if (!formData.name || formData.name.trim().length < 3) {
    erros.push('Nome deve ter pelo menos 3 caracteres');
  }

  if (!formData.phone || formData.phone.trim().length < 10) {
    erros.push('Telefone inválido');
  }

  if (!formData.email || !formData.email.includes('@')) {
    erros.push('Email inválido');
  }

  if (!formData.plate || formData.plate.trim().length < 7) {
    erros.push('Placa inválida');
  }

  if (formData.serviceRating < 1 || formData.serviceRating > 5) {
    erros.push('Avaliação de atendimento deve ser entre 1 e 5');
  }

  if (formData.recommendationRating < 1 || formData.recommendationRating > 5) {
    erros.push('Avaliação de recomendação deve ser entre 1 e 5');
  }

  return {
    valido: erros.length === 0,
    erros
  };
}

// Para debug no console do navegador
if (typeof window !== 'undefined') {
  (window as any).testarConexaoSheets = testarConexao;
  console.log('🔧 Debug: Use window.testarConexaoSheets() no console para testar a conexão');
}