'use client'
import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';

export default function GzoxSurvey() {
  const [formData, setFormData] = useState({
    store: '',
    name: '',
    phone: '',
    email: '',
    plate: '',
    serviceRating: 0,
    recommendationRating: 0
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.store || !formData.name.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.plate.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    if (formData.serviceRating === 0 || formData.recommendationRating === 0) {
      alert('Por favor, avalie todos os itens com estrelas');
      return;
    }
    setIsSubmitting(true);
    try {
      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxinsLcVumXrKtFI4qts0rudse8K6akYr-on0zRWAtVh-Bw6I9g_ibJEFd1YV4JwWHI/exec';
      
      const payload = {
        store: formData.store,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        plate: formData.plate,
        serviceRating: formData.serviceRating,
        recommendationRating: formData.recommendationRating,
        timestamp: new Date().toLocaleString('pt-BR')
      };

      console.log('📤 Enviando dados:', payload);

      // Usando no-cors para evitar erro de CORS
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      // Com no-cors não conseguimos ler a resposta, mas os dados são enviados
      console.log('✅ Dados enviados! Verifique a planilha.');

      setSubmitted(true);
      setFormData({
        store: '',
        name: '',
        phone: '',
        email: '',
        plate: '',
        serviceRating: 0,
        recommendationRating: 0
      });
      setTimeout(() => setSubmitted(false), 5000);

    } catch (error) {
      console.error('❌ Erro ao enviar:', error);
      alert('Erro ao enviar pesquisa. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ label, value, onChange }: { label: string; value: number; onChange: (val: number) => void }) => (
    <div className="mb-6">
      <label className="block text-gray-700 font-semibold mb-3">{label}</label>
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className="transition-all duration-200 hover:scale-110"
          >
            <Star
              size={48}
              className={`${value >= num
                ? 'fill-orange-500 stroke-orange-500'
                : 'fill-gray-200 stroke-gray-300'
                } transition-colors duration-200`}
            />
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
        <span>Péssimo</span>
        <span>Excelente</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-400 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-50 rounded-2xl shadow-xl p-8">
          {/* Logo Area */}
          <div className="text-center mb-6">
            <img
              src="/logo.png"
              alt="Logo G'ZOX"
              className="w-48 h-24 mx-auto object-contain"
            />
          </div>
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Obrigado por escolher a G'ZOX!</h2>
            <p className="text-gray-600 text-base max-w-xl mx-auto">
              Seu feedback neste rápido questionário é muito importante para entendermos como melhorar.
            </p>
            <div className="w-20 h-1 bg-orange-500 mx-auto mt-4 rounded"></div>
          </div>
          {/* Form */}
          <div className="space-y-6">
            {/* Seleção de Loja */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Selecione a Loja *
              </label>
              <select
                required
                value={formData.store}
                onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
              >
                <option value="">Escolha a loja...</option>
                <option value="Barra Blue">Barra Blue</option>
                <option value="Shopping Recreio">Shopping Recreio</option>
              </select>
            </div>
            {/* Nome */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Nome  *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                placeholder="Digite seu nome"
              />
            </div>
            {/* Telefone */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                placeholder="(00) 00000-0000"
              />
            </div>
            {/* Email */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                placeholder="seu@email.com"
              />
            </div>
            {/* Placa */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Placa do Veículo *
              </label>
              <input
                type="text"
                required
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition uppercase"
                placeholder="ABC-1234"
                maxLength={8}
              />
            </div>
            {/* Avaliação do Atendimento */}
            <StarRating
              label="Como você avalia nosso atendimento? *"
              value={formData.serviceRating}
              onChange={(val) => setFormData({ ...formData, serviceRating: val })}
            />
            {/* Recomendação */}
            <StarRating
              label="Quanto você recomendaria nosso serviço? *"
              value={formData.recommendationRating}
              onChange={(val) => setFormData({ ...formData, recommendationRating: val })}
            />
            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Send size={20} />
              {isSubmitting ? 'Enviando...' : 'Enviar Pesquisa'}
            </button>
            {/* Success Message */}
            {submitted && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-center animate-pulse">
                ✓ Pesquisa enviada com sucesso! Obrigado pelo seu feedback.
              </div>
            )}
          </div>
        </div>
        {/* Footer */}
        <p className="text-center text-white mt-6 text-sm">
          Seu feedback é muito importante para nós!
        </p>
      </div>
    </div>
  );
}