'use client'
import React, { useState } from 'react';
import { Star, Send, X, MessageSquare } from 'lucide-react';

export default function GzoxSurvey() {
  const [formData, setFormData] = useState({
    store: '',
    name: '',
    phone: '',
    email: '',
    plate: '',
    serviceRating: 0,
    recommendationRating: 0,
    comment: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);

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
        comment: formData.comment || 'Sem comentário',
        timestamp: new Date().toLocaleString('pt-BR')
      };

      console.log('📤 Enviando dados:', payload);

      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('✅ Dados enviados! Verifique a planilha.');

      // Mostra o cupom em tela cheia
      setShowCoupon(true);
      
      setSubmitted(true);
      setFormData({
        store: '',
        name: '',
        phone: '',
        email: '',
        plate: '',
        serviceRating: 0,
        recommendationRating: 0,
        comment: ''
      });

    } catch (error) {
      console.error('❌ Erro ao enviar:', error);
      alert('Erro ao enviar pesquisa. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeCoupon = () => {
    setShowCoupon(false);
    setSubmitted(false);
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
    <>
      {/* Modal de Cupom em Tela Cheia */}
      {showCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 animate-fadeIn">
          {/* Botão Fechar */}
          <button
            onClick={closeCoupon}
            className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Fechar cupom"
          >
            <X size={32} className="text-gray-800" />
          </button>

          {/* Container da Imagem */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src="/cupom.jpg"
              alt="Cupom de Desconto"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Formulário Principal */}
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
              {/* Campo de Comentário */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare size={18} />
                  Comentário (Opcional)
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => {
                    const text = e.target.value.slice(0, 100);
                    setFormData({ ...formData, comment: text });
                  }}
                  className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Deixe seu comentário aqui (máximo 100 caracteres)"
                  rows={3}
                  maxLength={100}
                />
                <div className="text-right mt-1">
                  <span className={`text-sm ${formData.comment.length >= 100 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                    {formData.comment.length}/100 caracteres
                  </span>
                </div>
              </div>
              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Send size={20} />
                {isSubmitting ? 'Enviando...' : 'Enviar Pesquisa'}
              </button>
            </div>
          </div>
          {/* Footer */}
          <p className="text-center text-white mt-6 text-sm">
            Seu feedback é muito importante para nós!
          </p>
        </div>
      </div>

      {/* CSS para animação */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
}