'use client'
import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Star, Users, ArrowLeft, RefreshCw, Phone, Mail, AlertTriangle, Award, Calendar, Filter, Search } from 'lucide-react';

interface Avaliacao {
  timestamp: string;
  store: string;
  name: string;
  phone: string;
  email: string;
  plate: string;
  serviceRating: number;
  recommendationRating: number;
  comment: string;
}

export default function AdminDashboard() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtroLoja, setFiltroLoja] = useState('todas');
  const [filtroNota, setFiltroNota] = useState('todas');
  const [busca, setBusca] = useState('');

  // Função melhorada para fazer parse do CSV
  const parseCSV = (csvText: string): Avaliacao[] => {
    const linhas = csvText.split('\n');
    const resultado: Avaliacao[] = [];
    
    // Pular a primeira linha (cabeçalho)
    for (let i = 1; i < linhas.length; i++) {
      const linha = linhas[i].trim();
      if (!linha) continue;
      
      // Parse mais robusto que lida com vírgulas dentro de aspas
      const valores: string[] = [];
      let valorAtual = '';
      let dentroAspas = false;
      
      for (let j = 0; j < linha.length; j++) {
        const char = linha[j];
        
        if (char === '"') {
          dentroAspas = !dentroAspas;
        } else if (char === ',' && !dentroAspas) {
          valores.push(valorAtual.trim());
          valorAtual = '';
        } else {
          valorAtual += char;
        }
      }
      valores.push(valorAtual.trim()); // Último valor
      
      // Validar se tem dados suficientes
      if (valores.length >= 9) {
        const serviceRating = parseInt(valores[6]) || 0;
        const recommendationRating = parseInt(valores[7]) || 0;
        
        // Só adicionar se as notas forem válidas (1-5)
        if (serviceRating >= 1 && serviceRating <= 5 && 
            recommendationRating >= 1 && recommendationRating <= 5) {
          resultado.push({
            timestamp: valores[0].replace(/"/g, ''),
            store: valores[1].replace(/"/g, ''),
            name: valores[2].replace(/"/g, ''),
            phone: valores[3].replace(/"/g, ''),
            email: valores[4].replace(/"/g, ''),
            plate: valores[5].replace(/"/g, ''),
            serviceRating,
            recommendationRating,
            comment: valores[8] ? valores[8].replace(/"/g, '') : 'Sem comentário',
          });
        }
      }
    }
    
    return resultado;
  };

  const carregarDados = async () => {
    setCarregando(true);
    setErro('');
    
    try {
      const PLANILHA_ID = '1m2TItv7VQn_aaQLaXMrVlQH9zHQgIpTRFnHvO0aLpmg';
      const url = `https://docs.google.com/spreadsheets/d/${PLANILHA_ID}/gviz/tq?tqx=out:csv&sheet=Respostas`;
      
      console.log('📥 Carregando dados da planilha...');
      const response = await fetch(url, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const csvText = await response.text();
      console.log('📄 CSV recebido, tamanho:', csvText.length);
      
      const dadosParsed = parseCSV(csvText);
      console.log('✅ Total de avaliações carregadas:', dadosParsed.length);
      
      if (dadosParsed.length === 0) {
        setErro('Nenhuma avaliação encontrada na planilha');
      }
      
      setAvaliacoes(dadosParsed);
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados da planilha. Verifique se a planilha está publicada.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Filtros avançados
  const avaliacoesFiltradas = avaliacoes.filter(a => {
    const matchLoja = filtroLoja === 'todas' || a.store === filtroLoja;
    const matchBusca = busca === '' || 
      a.name.toLowerCase().includes(busca.toLowerCase()) ||
      a.email.toLowerCase().includes(busca.toLowerCase()) ||
      a.phone.includes(busca);
    
    let matchNota = true;
    if (filtroNota === 'excelente') matchNota = a.serviceRating >= 4 && a.recommendationRating >= 4;
    else if (filtroNota === 'bom') matchNota = a.serviceRating === 3 || a.recommendationRating === 3;
    else if (filtroNota === 'ruim') matchNota = a.serviceRating <= 2 || a.recommendationRating <= 2;
    
    return matchLoja && matchBusca && matchNota;
  });

  // Função helper para calcular média com segurança
  const calcularMedia = (valores: number[]): string => {
    if (valores.length === 0) return '0.0';
    const soma = valores.reduce((acc, val) => acc + val, 0);
    const media = soma / valores.length;
    return media.toFixed(1);
  };

  // Estatísticas
  const totalAvaliacoes = avaliacoesFiltradas.length;
  const mediaAtendimento = calcularMedia(avaliacoesFiltradas.map(a => a.serviceRating));
  const mediaRecomendacao = calcularMedia(avaliacoesFiltradas.map(a => a.recommendationRating));

  // NPS Score
  const detratores = avaliacoesFiltradas.filter(a => a.recommendationRating <= 2).length;
  const neutros = avaliacoesFiltradas.filter(a => a.recommendationRating === 3).length;
  const promotores = avaliacoesFiltradas.filter(a => a.recommendationRating >= 4).length;
  const npsScore = totalAvaliacoes > 0 
    ? (((promotores - detratores) / totalAvaliacoes) * 100).toFixed(0)
    : '0';

  // Dados por loja
  const lojas = ['Barra Blue', 'Shopping Recreio'];
  const dadosPorLoja = lojas.map(loja => {
    const avaliacoesLoja = avaliacoes.filter(a => a.store === loja);
    const total = avaliacoesLoja.length;
    
    if (total === 0) {
      return {
        loja,
        total: 0,
        mediaAtendimento: 0,
        mediaRecomendacao: 0,
        mediaGeral: 0,
      };
    }
    
    const mediaAtend = parseFloat(calcularMedia(avaliacoesLoja.map(a => a.serviceRating)));
    const mediaRec = parseFloat(calcularMedia(avaliacoesLoja.map(a => a.recommendationRating)));
    
    return {
      loja,
      total,
      mediaAtendimento: mediaAtend,
      mediaRecomendacao: mediaRec,
      mediaGeral: parseFloat(((mediaAtend + mediaRec) / 2).toFixed(1)),
    };
  });

  // Distribuição de notas
  const distribuicaoNotas = [1, 2, 3, 4, 5].map(nota => ({
    nota: `${nota}★`,
    atendimento: avaliacoesFiltradas.filter(a => a.serviceRating === nota).length,
    recomendacao: avaliacoesFiltradas.filter(a => a.recommendationRating === nota).length,
  }));

  // Piores e melhores avaliações
  const pioresAvaliacoes = [...avaliacoesFiltradas]
    .sort((a, b) => {
      const mediaA = (a.serviceRating + a.recommendationRating) / 2;
      const mediaB = (b.serviceRating + b.recommendationRating) / 2;
      return mediaA - mediaB;
    })
    .slice(0, 10);

  const melhoresAvaliacoes = [...avaliacoesFiltradas]
    .sort((a, b) => {
      const mediaA = (a.serviceRating + a.recommendationRating) / 2;
      const mediaB = (b.serviceRating + b.recommendationRating) / 2;
      return mediaB - mediaA;
    })
    .slice(0, 10);

  // Evolução temporal
  const avaliacoesPorDia = avaliacoes.reduce((acc, av) => {
    const data = av.timestamp.split(',')[0] || av.timestamp.split(' ')[0];
    if (!acc[data]) acc[data] = [];
    acc[data].push(av);
    return acc;
  }, {} as Record<string, Avaliacao[]>);

  const evolucaoTemporal = Object.entries(avaliacoesPorDia)
    .slice(-30)
    .map(([data, avs]) => ({
      data,
      mediaAtendimento: parseFloat(calcularMedia(avs.map(a => a.serviceRating))),
      mediaRecomendacao: parseFloat(calcularMedia(avs.map(a => a.recommendationRating))),
      total: avs.length
    }));

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-orange-500" size={48} />
          <p className="text-xl text-gray-600">Carregando dados...</p>
          <p className="text-sm text-gray-400 mt-2">Isso pode levar alguns segundos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Star className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard G'ZOX</h1>
                <p className="text-sm text-gray-500">
                  {avaliacoes.length} avaliações no total | Última atualização: {new Date().toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={carregarDados}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition shadow-sm"
              >
                <RefreshCw size={18} />
                Atualizar
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('gzox_admin_auth');
                  localStorage.removeItem('gzox_admin_timestamp');
                  window.location.href = '/login';
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition shadow-sm"
              >
                <ArrowLeft size={18} />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter size={16} className="inline mr-2" />
                Filtrar por Loja
              </label>
              <select
                value={filtroLoja}
                onChange={(e) => setFiltroLoja(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="todas">Todas as Lojas</option>
                <option value="Barra Blue">Barra Blue</option>
                <option value="Shopping Recreio">Shopping Recreio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Star size={16} className="inline mr-2" />
                Filtrar por Avaliação
              </label>
              <select
                value={filtroNota}
                onChange={(e) => setFiltroNota(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="todas">Todas as Notas</option>
                <option value="excelente">Excelentes (4-5★)</option>
                <option value="bom">Boas (3★)</option>
                <option value="ruim">Ruins (1-2★)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search size={16} className="inline mr-2" />
                Buscar Cliente
              </label>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Nome, email ou telefone..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <Users size={32} className="opacity-80" />
              <span className="text-blue-100 text-sm font-medium">Total</span>
            </div>
            <p className="text-4xl font-bold mb-1">{totalAvaliacoes}</p>
            <p className="text-blue-100 text-sm">Avaliações Recebidas</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <Star size={32} className="opacity-80" />
              <span className="text-orange-100 text-sm font-medium">Atendimento</span>
            </div>
            <p className="text-4xl font-bold mb-1">{mediaAtendimento}</p>
            <p className="text-orange-100 text-sm">Média Geral ★</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp size={32} className="opacity-80" />
              <span className="text-purple-100 text-sm font-medium">Recomendação</span>
            </div>
            <p className="text-4xl font-bold mb-1">{mediaRecomendacao}</p>
            <p className="text-purple-100 text-sm">Média Geral ★</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <Award size={32} className="opacity-80" />
              <span className="text-green-100 text-sm font-medium">NPS Score</span>
            </div>
            <p className="text-4xl font-bold mb-1">{npsScore}%</p>
            <p className="text-green-100 text-sm">Net Promoter Score</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Comparativo de Lojas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosPorLoja}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="loja" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 5]} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="mediaAtendimento" fill="#f97316" name="Atendimento" radius={[8, 8, 0, 0]} />
                <Bar dataKey="mediaRecomendacao" fill="#ea580c" name="Recomendação" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Distribuição de Notas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distribuicaoNotas}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="nota" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="atendimento" fill="#3b82f6" name="Atendimento" radius={[8, 8, 0, 0]} />
                <Bar dataKey="recomendacao" fill="#8b5cf6" name="Recomendação" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {evolucaoTemporal.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Evolução das Avaliações</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evolucaoTemporal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="data" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 5]} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="mediaAtendimento" stroke="#f97316" strokeWidth={2} name="Atendimento" />
                  <Line type="monotone" dataKey="mediaRecomendacao" stroke="#ea580c" strokeWidth={2} name="Recomendação" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Tabelas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Piores */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} />
              Avaliações Críticas
            </h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {pioresAvaliacoes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma avaliação crítica 🎉</p>
              ) : (
                pioresAvaliacoes.map((av, idx) => (
                  <div key={idx} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{av.name}</span>
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">#{idx + 1}</span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">{av.store}</p>
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        {((av.serviceRating + av.recommendationRating) / 2).toFixed(1)}★
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white rounded-lg p-2 border border-red-200">
                        <p className="text-xs text-gray-500 mb-1">Atendimento</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} size={14} className="text-orange-500" fill={av.serviceRating >= i ? "#f97316" : "none"} />
                          ))}
                          <span className="ml-2 font-semibold text-gray-700">{av.serviceRating}/5</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-red-200">
                        <p className="text-xs text-gray-500 mb-1">Recomendação</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} size={14} className="text-orange-500" fill={av.recommendationRating >= i ? "#f97316" : "none"} />
                          ))}
                          <span className="ml-2 font-semibold text-gray-700">{av.recommendationRating}/5</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-red-200 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={14} className="text-red-600" />
                        <a href={`tel:${av.phone}`} className="text-gray-700 hover:text-red-600 font-medium">{av.phone}</a>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={14} className="text-red-600" />
                        <a href={`mailto:${av.email}`} className="text-gray-700 hover:text-red-600 font-medium truncate">{av.email}</a>
                      </div>
                      {av.comment && av.comment !== 'Sem comentário' && (
                        <div className="pt-2 border-t border-red-100">
                          <p className="text-xs text-gray-500 mb-1">💬 Comentário:</p>
                          <p className="text-sm text-gray-700 italic bg-red-50 p-2 rounded">"{av.comment}"</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-red-100">
                        <Calendar size={12} />
                        <span>{av.timestamp}</span>
                        <span className="ml-auto bg-red-100 text-red-700 px-2 py-0.5 rounded">Placa: {av.plate}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Melhores */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-green-600 mb-4 flex items-center gap-2">
              <Award size={20} />
              Avaliações Excelentes
            </h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {melhoresAvaliacoes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma avaliação encontrada</p>
              ) : (
                melhoresAvaliacoes.map((av, idx) => (
                  <div key={idx} className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{av.name}</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">#{idx + 1}</span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">{av.store}</p>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {((av.serviceRating + av.recommendationRating) / 2).toFixed(1)}★
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white rounded-lg p-2 border border-green-200">
                        <p className="text-xs text-gray-500 mb-1">Atendimento</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} size={14} className="text-orange-500" fill={av.serviceRating >= i ? "#f97316" : "none"} />
                          ))}
                          <span className="ml-2 font-semibold text-gray-700">{av.serviceRating}/5</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-green-200">
                        <p className="text-xs text-gray-500 mb-1">Recomendação</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} size={14} className="text-orange-500" fill={av.recommendationRating >= i ? "#f97316" : "none"} />
                          ))}
                          <span className="ml-2 font-semibold text-gray-700">{av.recommendationRating}/5</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      {av.comment && av.comment !== 'Sem comentário' && (
                        <div className="mb-2 pb-2 border-b border-green-100">
                          <p className="text-xs text-gray-500 mb-1">💬 Comentário:</p>
                          <p className="text-sm text-gray-700 italic bg-green-50 p-2 rounded">"{av.comment}"</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={12} />
                        <span>{av.timestamp}</span>
                        <span className="ml-auto bg-green-100 text-green-700 px-2 py-0.5 rounded">{av.store}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {erro && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            <p className="font-semibold">⚠️ Erro:</p>
            <p className="text-sm">{erro}</p>
          </div>
        )}
      </div>
    </div>
  );
}