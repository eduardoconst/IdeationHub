/**
 * RESUMO: CreateIdeaModal.tsx
 * 
 * O que faz:
 * - Modal para criação de novas ideias
 * - Formulário completo com preview em tempo real
 * - Validação de campos obrigatórios
 * - Seleção de duração da votação (1h a 1 semana)
 * - Contadores de caracteres para título e descrição
 * 
 * Principais funções:
 * - handleSubmit(): Cria nova ideia e chama callback
 * - handleChange(): Atualiza campos e limpa erros
 * - validateForm(): Valida título, descrição e duração
 * - onSubmit prop: Callback para quando ideia é criada
 * 
 * Funcionalidades especiais:
 * - Preview em tempo real da ideia sendo criada
 * - Limites de caracteres (título: 100, descrição: 500)
 * - Dropdown com opções pré-definidas de duração
 * - Validação de comprimento mínimo dos textos
 * - Reset automático do formulário após envio
 * - Design consistente com outros modais
 */

import { useState } from 'react';

interface CreateIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (idea: { title: string; description: string; duration: number }) => void;
}

const CreateIdeaModal = ({ isOpen, onClose, onSubmit }: CreateIdeaModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 24 // horas
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'duration' ? parseInt(value) : value 
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Título deve ter pelo menos 5 caracteres';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Descrição deve ter pelo menos 10 caracteres';
    }

    if (formData.duration < 1 || formData.duration > 168) {
      newErrors.duration = 'Duração deve ser entre 1 e 168 horas (7 dias)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    // TODO: Implementar lógica de criação
    console.log('Nova ideia:', formData);
    
    if (onSubmit) {
      onSubmit(formData);
    }
    
    // Simular delay de API
    setTimeout(() => {
      setIsLoading(false);
      setFormData({ title: '', description: '', duration: 24 });
      onClose();
    }, 1000);
  };

  const durationOptions = [
    { value: 1, label: '1 hora' },
    { value: 6, label: '6 horas' },
    { value: 12, label: '12 horas' },
    { value: 24, label: '1 dia' },
    { value: 48, label: '2 dias' },
    { value: 72, label: '3 dias' },
    { value: 168, label: '1 semana' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            💡 Nova Ideia
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título da ideia
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Ex: Implementar sistema de gamificação"
              maxLength={100}
            />
            <div className="flex justify-between mt-1">
              {errors.title && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.title}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                {formData.title.length}/100
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição detalhada
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Descreva sua ideia em detalhes. Explique o problema que ela resolve, como funcionaria e quais benefícios traria..."
              maxLength={500}
            />
            <div className="flex justify-between mt-1">
              {errors.description && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.description}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                {formData.description.length}/500
              </p>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tempo de votação
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                errors.duration ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {durationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.duration}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Após esse período, a votação será fechada automaticamente
            </p>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preview da ideia:
            </h3>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                {formData.title || 'Título da ideia'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {formData.description || 'Descrição da ideia aparecerá aqui...'}
              </p>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
                  ⏰ {formData.duration}h restante
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  👍 0 • 👎 0
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title.trim() || !formData.description.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                'Publicar Ideia'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIdeaModal;
