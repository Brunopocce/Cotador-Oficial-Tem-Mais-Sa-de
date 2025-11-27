
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../supabaseClient';

interface AdminPanelProps {
  users: User[]; // Deprecated
  onApprove: (cpf: string) => void; // Deprecated
  onReject: (cpf: string) => void; // Deprecated
  onLogout: () => void;
  onRefresh?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [realUsers, setRealUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  
  const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
          // Map snake_case to camelCase
          const mapped: User[] = data.map((u: any) => ({
              ...u,
              isAdmin: u.is_admin,
              createdAt: u.created_at
          }));
          setRealUsers(mapped);
      }
  };

  // Real-time listener for users
  useEffect(() => {
    fetchUsers();

    const channel = supabase
        .channel('public:users')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
            console.log('Change received!', payload);
            fetchUsers(); // Simple refetch on change
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (targetCpf: string, status: 'approved' | 'rejected') => {
      // Find ID by CPF (since we need ID to update)
      // Note: In production, passing ID directly to updateStatus is better
      const userToUpdate = realUsers.find(u => u.cpf === targetCpf);
      if (!userToUpdate || !userToUpdate.id) return;

      await supabase
        .from('users')
        .update({ status: status })
        .eq('id', userToUpdate.id);
  };

  const pendingUsers = realUsers.filter(u => u.status === 'pending');
  const allUsers = realUsers.filter(u => !u.isAdmin);

  const displayedUsers = filter === 'pending' ? pendingUsers : allUsers;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <span className="text-xl font-bold text-[#003366]">Painel Administrativo (Supabase)</span>
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
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800">
                {filter === 'pending' ? 'Solicitações Pendentes' : 'Todos os Usuários'}
            </h2>
          </div>
          
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
                              onClick={() => updateStatus(user.cpf, 'rejected')}
                              className="px-4 py-2 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 transition-colors text-sm"
                            >
                              Recusar
                            </button>
                            <button 
                              onClick={() => updateStatus(user.cpf, 'approved')}
                              className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors text-sm shadow-md"
                            >
                              Aprovar Acesso
                            </button>
                         </>
                      )}
                      {user.status === 'approved' && (
                         <button 
                            onClick={() => updateStatus(user.cpf, 'rejected')}
                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                         >
                            Revogar Acesso
                         </button>
                      )}
                      {user.status === 'rejected' && (
                         <button 
                            onClick={() => updateStatus(user.cpf, 'approved')}
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
