import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Plus, Edit, Trash2, Shield, Heart, AlertTriangle, Clock, MapPin } from 'lucide-react';

interface EmergenciaProps {
  onNavigate: (page: string) => void;
}

interface ContatoEmergencia {
  id: string;
  nome: string;
  telefone: string;
  relacao: string;
  tipo: 'pessoal' | 'profissional';
  disponibilidade?: string;
  observacoes?: string;
}

const Emergencia: React.FC<EmergenciaProps> = ({ onNavigate }) => {
  const [contatos, setContatos] = useState<ContatoEmergencia[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [contatoEditando, setContatoEditando] = useState<ContatoEmergencia | null>(null);
  const [novoContato, setNovoContato] = useState<Partial<ContatoEmergencia>>({
    nome: '',
    telefone: '',
    relacao: '',
    tipo: 'pessoal',
    disponibilidade: '',
    observacoes: ''
  });

  // Contatos fixos de emergência
  const contatosFixos = [
    {
      nome: 'CVV - Centro de Valorização da Vida',
      telefone: '188',
      descricao: 'Prevenção do suicídio - 24h gratuito',
      cor: 'bg-red-500',
      icone: '🆘',
      whatsapp: false
    },
    {
      nome: 'SAMU - Serviço de Atendimento Móvel de Urgência',
      telefone: '192',
      descricao: 'Emergências médicas - 24h gratuito',
      cor: 'bg-blue-500',
      icone: '🚑',
      whatsapp: false
    },
    {
      nome: 'Polícia Militar',
      telefone: '190',
      descricao: 'Emergências de segurança - 24h gratuito',
      cor: 'bg-gray-600',
      icone: '👮',
      whatsapp: false
    },
    {
      nome: 'Bombeiros',
      telefone: '193',
      descricao: 'Emergências e resgates - 24h gratuito',
      cor: 'bg-orange-500',
      icone: '🚒',
      whatsapp: false
    },
    {
      nome: 'Disque Denúncia Violência Doméstica',
      telefone: '180',
      descricao: 'Denúncias de violência - 24h gratuito',
      cor: 'bg-purple-500',
      icone: '🛡️',
      whatsapp: false
    },
    {
      nome: 'CAPS - Centro de Atenção Psicossocial',
      telefone: '0800-644-0011',
      descricao: 'Atendimento em saúde mental',
      cor: 'bg-green-500',
      icone: '🧠',
      whatsapp: false
    }
  ];

  useEffect(() => {
    carregarContatos();
  }, []);

  const carregarContatos = () => {
    const contatosSalvos = localStorage.getItem('contatos_emergencia');
    if (contatosSalvos) {
      setContatos(JSON.parse(contatosSalvos));
    }
  };

  const salvarContatos = (novosContatos: ContatoEmergencia[]) => {
    localStorage.setItem('contatos_emergencia', JSON.stringify(novosContatos));
    setContatos(novosContatos);
  };

  const adicionarContato = () => {
    if (!novoContato.nome || !novoContato.telefone) {
      alert('Nome e telefone são obrigatórios');
      return;
    }

    const contato: ContatoEmergencia = {
      id: Date.now().toString(),
      nome: novoContato.nome!,
      telefone: novoContato.telefone!,
      relacao: novoContato.relacao || '',
      tipo: novoContato.tipo || 'pessoal',
      disponibilidade: novoContato.disponibilidade,
      observacoes: novoContato.observacoes
    };

    salvarContatos([...contatos, contato]);
    setNovoContato({
      nome: '',
      telefone: '',
      relacao: '',
      tipo: 'pessoal',
      disponibilidade: '',
      observacoes: ''
    });
    setMostrarFormulario(false);
  };

  const editarContato = () => {
    if (!contatoEditando || !contatoEditando.nome || !contatoEditando.telefone) {
      alert('Nome e telefone são obrigatórios');
      return;
    }

    const contatosAtualizados = contatos.map(c => 
      c.id === contatoEditando.id ? contatoEditando : c
    );
    
    salvarContatos(contatosAtualizados);
    setContatoEditando(null);
  };

  const removerContato = (id: string) => {
    if (confirm('Tem certeza que deseja remover este contato?')) {
      const contatosAtualizados = contatos.filter(c => c.id !== id);
      salvarContatos(contatosAtualizados);
    }
  };

  const fazerLigacao = (telefone: string) => {
    window.open(`tel:${telefone}`);
  };

  const abrirWhatsApp = (telefone: string, nome: string) => {
    const numeroLimpo = telefone.replace(/\D/g, '');
    const mensagem = encodeURIComponent(`Olá ${nome}, preciso de ajuda. Esta é uma situação de emergência.`);
    window.open(`https://wa.me/55${numeroLimpo}?text=${mensagem}`);
  };

  const estrategiasCrise = [
    {
      titulo: 'Técnica de Respiração 4-7-8',
      descricao: 'Inspire por 4 segundos, segure por 7, expire por 8',
      icone: '🫁',
      cor: 'bg-blue-50 border-blue-200'
    },
    {
      titulo: 'Técnica 5-4-3-2-1',
      descricao: '5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira, 1 que saboreia',
      icone: '👁️',
      cor: 'bg-green-50 border-green-200'
    },
    {
      titulo: 'Lugar Seguro Mental',
      descricao: 'Visualize um lugar onde se sente completamente seguro e calmo',
      icone: '🏠',
      cor: 'bg-purple-50 border-purple-200'
    },
    {
      titulo: 'Afirmações Positivas',
      descricao: 'Repita: "Isso vai passar", "Estou seguro agora", "Posso lidar com isso"',
      icone: '💪',
      cor: 'bg-yellow-50 border-yellow-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Shield className="h-8 w-8 text-red-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Plano de Emergência
            </h1>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <p className="text-red-800 dark:text-red-200 font-medium">
                  Se você está em crise ou pensando em se machucar:
                </p>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                  Ligue imediatamente para o CVV (188) ou procure o hospital mais próximo. Você não está sozinho.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contatos de Emergência Fixos */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Phone className="h-6 w-6 mr-2 text-red-500" />
            Contatos de Emergência
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contatosFixos.map((contato, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 ${contato.cor} rounded-full flex items-center justify-center text-white text-xl mr-3`}>
                      {contato.icone}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {contato.nome}
                      </h3>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {contato.telefone}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {contato.descricao}
                </p>
                <button
                  onClick={() => fazerLigacao(contato.telefone)}
                  className={`w-full ${contato.cor} hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center`}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Ligar Agora
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Estratégias de Crise */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Heart className="h-6 w-6 mr-2 text-pink-500" />
            Estratégias de Crise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {estrategiasCrise.map((estrategia, index) => (
              <div key={index} className={`${estrategia.cor} border rounded-xl p-6`}>
                <div className="flex items-start">
                  <div className="text-2xl mr-3">{estrategia.icone}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {estrategia.titulo}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {estrategia.descricao}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contatos Pessoais */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <MessageCircle className="h-6 w-6 mr-2 text-blue-500" />
              Seus Contatos de Apoio
            </h2>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Contato
            </button>
          </div>

          {contatos.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum contato pessoal cadastrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Adicione contatos de pessoas próximas que podem te ajudar em momentos difíceis
              </p>
              <button
                onClick={() => setMostrarFormulario(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Adicionar Primeiro Contato
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contatos.map((contato) => (
                <div key={contato.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {contato.nome}
                      </h3>
                      <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
                        {contato.telefone}
                      </p>
                      {contato.relacao && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {contato.relacao}
                        </p>
                      )}
                      {contato.disponibilidade && (
                        <div className="flex items-center mt-2">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {contato.disponibilidade}
                          </p>
                        </div>
                      )}
                      {contato.observacoes && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {contato.observacoes}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setContatoEditando(contato)}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removerContato(contato.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => fazerLigacao(contato.telefone)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Ligar
                    </button>
                    <button
                      onClick={() => abrirWhatsApp(contato.telefone, contato.nome)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Adicionar/Editar Contato */}
        {(mostrarFormulario || contatoEditando) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {contatoEditando ? 'Editar Contato' : 'Adicionar Contato'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={contatoEditando ? contatoEditando.nome : novoContato.nome}
                    onChange={(e) => {
                      if (contatoEditando) {
                        setContatoEditando({ ...contatoEditando, nome: e.target.value });
                      } else {
                        setNovoContato({ ...novoContato, nome: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    placeholder="Nome da pessoa"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={contatoEditando ? contatoEditando.telefone : novoContato.telefone}
                    onChange={(e) => {
                      if (contatoEditando) {
                        setContatoEditando({ ...contatoEditando, telefone: e.target.value });
                      } else {
                        setNovoContato({ ...novoContato, telefone: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Relação
                  </label>
                  <input
                    type="text"
                    value={contatoEditando ? contatoEditando.relacao : novoContato.relacao}
                    onChange={(e) => {
                      if (contatoEditando) {
                        setContatoEditando({ ...contatoEditando, relacao: e.target.value });
                      } else {
                        setNovoContato({ ...novoContato, relacao: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    placeholder="Ex: Mãe, Amigo, Terapeuta"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Disponibilidade
                  </label>
                  <input
                    type="text"
                    value={contatoEditando ? contatoEditando.disponibilidade : novoContato.disponibilidade}
                    onChange={(e) => {
                      if (contatoEditando) {
                        setContatoEditando({ ...contatoEditando, disponibilidade: e.target.value });
                      } else {
                        setNovoContato({ ...novoContato, disponibilidade: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    placeholder="Ex: 24h, Horário comercial"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={contatoEditando ? contatoEditando.observacoes : novoContato.observacoes}
                    onChange={(e) => {
                      if (contatoEditando) {
                        setContatoEditando({ ...contatoEditando, observacoes: e.target.value });
                      } else {
                        setNovoContato({ ...novoContato, observacoes: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    rows={3}
                    placeholder="Informações adicionais"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setMostrarFormulario(false);
                    setContatoEditando(null);
                    setNovoContato({
                      nome: '',
                      telefone: '',
                      relacao: '',
                      tipo: 'pessoal',
                      disponibilidade: '',
                      observacoes: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={contatoEditando ? editarContato : adicionarContato}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {contatoEditando ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Links Úteis */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Recursos Adicionais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Online</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                <li>• Chat CVV: cvv.org.br</li>
                <li>• Mapa da Saúde Mental: mapasaudemental.com.br</li>
                <li>• CAPS Localizador: portalms.saude.gov.br</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Aplicativos</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                <li>• Pode Falar (CVV)</li>
                <li>• Querida Ansiedade</li>
                <li>• Lojong Meditação</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emergencia;