
import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../supabaseClient';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onRegister: (newUser: User) => void;
  users: User[];
}

export const LoginScreen: React.FC<LoginScreenProps> = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login State
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Register State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCpf, setNewCpf] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // --- MASKS & FORMATTING ---

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleNumericPasswordChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val) && val.length <= 6) {
      setter(val);
      setError('');
    }
  };

  // --- HELPER ---
  const getEmailFromCpf = (cpfInput: string) => {
      const cleanCpf = cpfInput.replace(/\D/g, '');
      return `${cleanCpf}@temmaissaude.com`;
  };

  // --- SUPABASE LOGIN ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fakeEmail = getEmailFromCpf(cpf);

    try {
        const { error } = await supabase.auth.signInWithPassword({
            email: fakeEmail,
            password: password,
        });

        if (error) throw error;
        // Success: App.tsx listener handles redirection
    } catch (err: any) {
        console.error(err);
        if (err.message.includes('Invalid login credentials')) {
            setError('CPF ou senha inválidos (Se é seu primeiro acesso, faça o cadastro).');
        } else {
            setError(`Erro: ${err.message}`);
        }
        setLoading(false);
    }
  };

  // --- SUPABASE REGISTER ---
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!newName || !newEmail || !newPhone || !newCpf || !newPassword) {
        setError('Por favor, preencha todos os campos.');
        setLoading(false);
        return;
    }

    if (newPassword.length !== 6) {
        setError('A senha deve conter exatamente 6 dígitos numéricos.');
        setLoading(false);
        return;
    }

    const fakeEmail = getEmailFromCpf(newCpf);
    const cleanCpf = newCpf.replace(/\D/g, '');

    // Auto Admin logic
    const isAdmin = cleanCpf === '236616';
    const initialStatus = isAdmin ? 'approved' : 'pending';

    try {
        // 1. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: fakeEmail,
            password: newPassword,
        });

        if (authError) throw authError;

        if (authData.user) {
            // 2. Insert into 'users' table
            const { error: dbError } = await supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    cpf: newCpf,
                    name: newName,
                    email: newEmail,
                    phone: newPhone,
                    status: initialStatus,
                    is_admin: isAdmin,
                    // created_at is automatic default now()
                });

            if (dbError) throw dbError;

            setSuccessMsg(isAdmin 
                ? 'Conta de Administrador criada com sucesso! Acessando...'
                : 'Cadastro realizado com sucesso! Aguarde a aprovação do administrador. Você será notificado pelo WhatsApp.'
            );
            
            if (!isAdmin) {
                setIsRegistering(false);
            }
        }
        setLoading(false);

    } catch (err: any) {
        console.error(err);
        if (err.message.includes('User already registered') || err.code === '23505') {
            setError('Este CPF já possui cadastro. Tente fazer login.');
        } else {
            setError(`Erro: ${err.message}`);
        }
        setLoading(false);
    }
  };

  const toggleMode = () => {
      setIsRegistering(!isRegistering);
      setError('');
      setSuccessMsg('');
      setCpf('');
      setPassword('');
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewCpf('');
      setNewPassword('');
      setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex flex-col items-center mb-6">
            <div className="flex items-center mb-2">
                <span className="text-4xl font-bold text-[#003366] tracking-tight">TEM</span>
                <div className="mx-1 relative flex items-center justify-center h-10 w-10">
                    <div className="absolute inset-0 bg-[#003366] rounded opacity-10 transform rotate-45"></div>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-[#003366] z-10">
                       <path d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M17,13h-3.5V16.5 c0,0.83-0.67,1.5-1.5,1.5s-1.5-0.67-1.5-1.5V13H7c-0.83,0-1.5-0.67-1.5-1.5S6.17,10,7,10h3.5V6.5C10.5,5.67,11.17,5,12,5 s1.5,0.67,1.5,1.5V10H17c0.83,0,1.5,0.67,1.5,1.5S17.83,13,17,13z"/>
                       <path fillOpacity="0.3" d="M12,8c-2.21,0-4,1.79-4,4s1.79,4,4,4s4-1.79,4-4S14.21,8,12,8z M12,14c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2 S13.1,14,12,14z"/>
                    </svg>
                </div>
                <span className="text-5xl font-cursive text-[#003366] -ml-1 mt-2">Saúde</span>
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Cotador Oficial</p>
        </div>

        {!isRegistering && (
            <form onSubmit={handleLoginSubmit} className="space-y-5 animate-slideUp">
                {successMsg && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm text-center font-bold border border-green-200">{successMsg}</div>}
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            value={cpf}
                            onChange={(e) => {
                                setCpf(formatCPF(e.target.value));
                                setError('');
                            }}
                            placeholder="000.000.000-00"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            maxLength={14}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                        </span>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            placeholder="••••••"
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                         <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium border border-red-200">{error}</div>}

                <button
                    type="submit"
                    disabled={loading || !cpf || !password}
                    className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all transform 
                        ${loading || !cpf || !password ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#003366] hover:bg-[#002244] hover:scale-[1.02]'}`}
                >
                    {loading ? 'Entrando...' : 'Acessar Cotador'}
                </button>
            </form>
        )}

        {/* --- REGISTER FORM --- */}
        {isRegistering && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-slideIn">
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Nome Completo</label>
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Seu nome"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">CPF</label>
                        <input
                            type="text"
                            value={newCpf}
                            onChange={(e) => setNewCpf(formatCPF(e.target.value))}
                            placeholder="000.000.000-00"
                            maxLength={14}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Telefone</label>
                        <input
                            type="text"
                            value={newPhone}
                            onChange={(e) => setNewPhone(formatPhone(e.target.value))}
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Email</label>
                    <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Senha (6 Números)</label>
                    <div className="relative">
                         <input
                            type={showPassword ? 'text' : 'password'}
                            inputMode="numeric"
                            value={newPassword}
                            onChange={(e) => handleNumericPasswordChange(e, setNewPassword)}
                            placeholder="123456"
                            maxLength={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm tracking-widest"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-2 rounded text-xs text-center font-medium">{error}</div>}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all transform 
                        ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#003366] hover:bg-[#002244] hover:scale-[1.02]'}`}
                >
                    {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                </button>
            </form>
        )}

        <div className="mt-6 text-center">
            <button 
                onClick={toggleMode}
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-all"
            >
                {isRegistering 
                    ? 'Já tem uma conta? Voltar para Login' 
                    : 'Não tem conta? Cadastre-se'}
            </button>
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Tem Mais Saúde. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
};
