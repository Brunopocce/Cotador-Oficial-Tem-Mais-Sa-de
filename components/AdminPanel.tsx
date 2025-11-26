
import React, { useState } from 'react';
import { User } from '../types';

interface AdminPanelProps {
  users: User[];
  onApprove: (cpf: string) => void;
  onReject: (cpf: string) => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ users, onApprove, onReject, onLogout }) => {
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const pendingUsers = users.filter(u => u.status === 'pending');
  const allUsers = users.filter(u => !u.isAdmin);

  const displayedUsers = filter === 'pending' ? pendingUsers : allUsers;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <span className="text-xl font-bold text-[#003366]">Painel Administrativo</span>
          </div>
          <button 
            onClick={onLogout}
            className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
             {filter === 'pending' ? 'Solicitações Pendentes' : 'Todos os Usuários'}
          </h2>
          <div className="flex bg-gray-200 p-1 rounded-lg">
             <button 
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === 'pending' ? 'bg-white shadow text-[#003366]' : 'text-gray-500 hover:text-gray-700'}`}
             >
                Pendentes ({pendingUsers.length})
             </button>
             <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === 'all' ? 'bg-white shadow text-[#003366]' : 'text-gray-500 hover:text-gray-700'}`}
             >
                Todos
             </button>
          </div>
        </div>

        {displayedUsers.length === 0 ? (
           <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
              <p>Nenhum usuário encontrado nesta categoria.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
             {displayedUsers.map((user) => (
                <div key={user.cpf} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-900">{user.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                           ${user.status === 'approved' ? 'bg-green-100 text-green-700' : 
                             user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                           {user.status === 'pending' ? 'Aguardando Aprovação' : 
                            user.status === 'approved' ? 'Aprovado' : 'Recusado'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                         <p><strong>CPF:</strong> {user.cpf}</p>
                         <p><strong>Tel:</strong> {user.phone}</p>
                         <p><strong>Email:</strong> {user.email}</p>
                         {user.createdAt && (
                            <p><strong>Data de Cadastro:</strong> {new Date(user.createdAt).toLocaleDateString('pt-BR')} às {new Date(user.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                         )}
                      </div>
                   </div>

                   <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0">
                      {user.status === 'pending' && (
                         <>
                            <button 
                              onClick={() => onReject(user.cpf)}
                              className="px-4 py-2 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 transition-colors text-sm"
                            >
                              Recusar
                            </button>
                            <button 
                              onClick={() => onApprove(user.cpf)}
                              className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors text-sm shadow-md"
                            >
                              Aprovar Acesso
                            </button>
                         </>
                      )}
                      {user.status === 'approved' && (
                         <button 
                            onClick={() => onReject(user.cpf)}
                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                         >
                            Revogar Acesso
                         </button>
                      )}
                      {user.status === 'rejected' && (
                         <button 
                            onClick={() => onApprove(user.cpf)}
                            className="text-sm text-green-600 hover:text-green-800 font-medium"
                         >
                            Reativar Acesso
                         </button>
                      )}
                   </div>
                </div>
             ))}
          </div>
        )}
      </main>
    </div>
  );
};
