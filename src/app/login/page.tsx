'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Logo from '../components/Logo';
import axios from 'axios'; // Certifique-se de que axios está importado
import { useAuthStore } from '@/stores/useAuthStore';

const Login = () => {
const [matricula, setMatricula] = useState<string>('');
const [senha, setSenha] = useState<string>('');
const [error, setError] = useState<string>('');
const { setToken } = useAuthStore();
const router = useRouter();

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

const handleLogin = async () => {
  try {
    // Validação básica
    if (!matricula || !senha) {
      setError("Preencha todos os campos!");
      return;
    }

    // Requisição de login
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { matricula, senha });

    // Persistência do token
    localStorage.setItem('token', response.data.token); // Armazenamento local
    setToken(response.data.token); // Atualização do Zustand (opcional)

    // Redirecionamento com garantia de sincronização
    router.push('/dashboard');
  } catch (error) {
    console.error("❌ Erro no login:", error);
    setError("Credenciais inválidas ou problema de conexão!");
  }
};

return (
 <div className="flex items-center justify-center min-h-screen bg-cinza">
   <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
     <div className="flex justify-center mb-6">
     <Logo className="w-32 h-24" />     </div>
     <h1 className="mb-4 text-2xl font-bold text-center text-preto">
       Login - InStock
     </h1>
     <input
       type="text"
       placeholder="Matrícula"
       value={matricula}
       onChange={(e) => setMatricula(e.target.value)}
       className="w-full px-4 py-2 mb-4 border border-cinza rounded focus:outline-none focus:ring-2 focus:ring-azul2"
     />
     <input
       type="password"
       placeholder="Senha"
       value={senha}
       onChange={(e) => setSenha(e.target.value)}
       className="w-full px-4 py-2 mb-2 border border-cinza rounded focus:outline-none focus:ring-2 focus:ring-azul2"
     />
     {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
     <div className="flex justify-between items-center mt-4">
       <button
         className="text-sm text-blue-500 hover:underline ml-auto"
         onClick={() => router.push('/forgot-password')}
       >
         Esqueceu a senha?
       </button>
     </div>

     <button
       className="w-full px-4 py-2 font-bold text-white bg-azul hover:bg-azul2 rounded mt-4"
       onClick={(e) => {
        e.preventDefault();
        handleLogin();
      }}
    >
       Entrar
     </button>
   </div>
 </div>
);
};

export default Login;
