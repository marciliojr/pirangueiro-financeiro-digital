import React, { useState, useEffect, useRef } from 'react';
import NotificationService from '../../services/NotificationService';

interface Notificacao {
  id: number;
  mensagem: string;
  data: string;
}

export const NotificationBell: React.FC = () => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const carregarNotificacoes = async () => {
    const novasNotificacoes = await NotificationService.getNotificacoes();
    setNotificacoes(novasNotificacoes);
  };

  const handleMarcarComoLida = async (id: number) => {
    const sucesso = await NotificationService.marcarComoLida(id);
    if (sucesso) {
      setNotificacoes(notificacoes.filter(notif => notif.id !== id));
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full focus:outline-none"
      >
        <span className="text-2xl">🔔</span>
        {notificacoes.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {notificacoes.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto dark:bg-gray-800">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Notificações</h3>
          </div>
          
          {notificacoes.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Nenhuma notificação não lida
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  onClick={() => handleMarcarComoLida(notificacao.id)}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150"
                >
                  <p className="text-sm text-gray-800 dark:text-gray-200">{notificacao.mensagem}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(notificacao.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 