"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Logo from '../components/Logo';
import { login } from '../services/auth';

const Login = () => {
  const [matricula, setMatricula] = useState<string>(''); // Estado para matrícula
  const [senha, setSenha] = useState<string>(''); // Estado para senha
  const [error, setError] = useState<string>(''); // Estado para mensagem de erro
  const router = useRouter();

  const handleLogin = async () => {
    setError(''); // Limpa mensagens de erro antes de tentar
    try {
      const response = await login({ matricula, senha }); // Chamada ao backend
      localStorage.setItem('token', response.token); // Salva o token no localStorage
      router.push('/dashboard'); // Redireciona para o dashboard
    } catch (err) {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cinza">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        {/* Logo Centralizado */}
        <div className="flex justify-center mb-6">
          <Logo width={180} height={143} />
        </div>

        <h1 className="mb-4 text-2xl font-bold text-center text-preto">Login - InStock</h1>

        {/* Campo Matrícula */}
        <input
          type="text"
          placeholder="Matrícula"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-cinza rounded focus:outline-none focus:ring-2 focus:ring-azul2"
        />

        {/* Campo Senha */}
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full px-4 py-2 mb-2 border border-cinza rounded focus:outline-none focus:ring-2 focus:ring-azul2"
        />

        {/* Mensagem de Erro */}
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {/* Botão Esqueceu a Senha */}
        <div className="flex justify-end mt-2 mb-6">
          <button
            className="text-sm text-blue-500 hover:underline"
            onClick={() => router.push('/recuperar-senha')}
          >
            Esqueceu a senha?
          </button>
        </div>

        {/* Botão Entrar */}
        <button
          className="w-full px-4 py-2 font-bold text-white bg-azul hover:bg-azul2 rounded"
          onClick={handleLogin}
        >
          Entrar
        </button>
      </div>
    </div>
  );
};

export default Login;
