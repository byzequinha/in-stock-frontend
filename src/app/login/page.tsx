'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Logo from '../components/Logo';
import { login } from '../services/auth';
import { useAuthStore } from '@/stores/useAuthStore';

const Login = () => {
  const [matricula, setMatricula] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { setToken } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    try {
      const response = await login({ matricula, senha });
      if (response.token) {
        setToken(response.token);
        localStorage.setItem('token', response.token);
        router.push('/dashboard');
      } else {
        setError('Credenciais inválidas. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao autenticar. Tente novamente.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cinza">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <div className="flex justify-center mb-6">
          <Logo width={180} height={143} />
        </div>
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
          onClick={handleLogin}
        >
          Entrar
        </button>
      </div>
    </div>
  );
};

export default Login;
