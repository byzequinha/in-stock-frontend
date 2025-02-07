'use client';

import Logo from '@/app/components/Logo';
import { useAuthStore } from '@/stores/useAuthStore';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  AiOutlineDownload,
  AiOutlineHome,
  AiOutlineLogout,
  AiOutlineSetting,
  AiOutlineUpload,
  AiOutlineUser,
} from 'react-icons/ai';
import { GrAlert } from 'react-icons/gr';

interface Product {
  name: string;
  quantity: number;
  created_at: string;
}

interface Alert {
  name: string;
  quantity: number;
  min_stock: number;
}

interface User {
  nome: string;
  nivel: string;
  last_login: string;
}

const Dashboard = () => {
  const router = useRouter();
  const { token, setToken } = useAuthStore();
  const [entries, setEntries] = useState<Product[]>([]);
  const [exits, setExits] = useState<Product[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  const handleLogout = useCallback(() => {
    setToken('');
    localStorage.removeItem('token');
    router.push('/login');
  }, [router, setToken]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [entriesResponse, exitsResponse, alertsResponse, userResponse] =
        await Promise.all([
          axios.get(`${API_BASE_URL}/api/products/entries`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/products/exits`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/products/alerts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/auth/user`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      setEntries(entriesResponse.data);
      setExits(exitsResponse.data);
      setAlerts(alertsResponse.data);
      setUser(userResponse.data);
      setLoadingUser(false);
    } catch (error) {
      console.error('Erro ao carregar dados do Dashboard:', error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          console.error('Recurso não encontrado:', error.config?.url);
        } else {
          console.error('Erro de API:', error.message);
        }
      }
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    } else {
      handleLogout();
    }
  }, [token, fetchDashboardData, handleLogout]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Menu lateral */}
      <aside className="w-16 bg-white shadow-lg flex flex-col items-center py-6">
        {/* TODO Resolver o tamanho do Logo */}
        <Logo className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16" />{' '}
        <nav className="mt-10 flex flex-col space-y-6">
          <AiOutlineHome
            size={24}
            className="text-gray-600 hover:text-blue-500 cursor-pointer"
            onClick={() => router.push('/dashboard')}
            title="Início"
          />
          <AiOutlineDownload
            size={24}
            className="text-gray-600 hover:text-blue-500 cursor-pointer"
            onClick={() => router.push('/entries')}
            title="Entradas"
          />
          <AiOutlineUpload
            size={24}
            className="text-gray-600 hover:text-blue-500 cursor-pointer"
            onClick={() => router.push('/exits')}
            title="Saídas"
          />
        </nav>
        <div className="mt-auto space-y-6">
          <AiOutlineUser
            size={24}
            className="text-gray-600 hover:text-blue-500 cursor-pointer"
            onClick={() => router.push('/profile')}
            title="Perfil"
          />
          {user?.nivel === 'Supervisor' && (
            <AiOutlineSetting
              size={24}
              className="text-gray-600 hover:text-blue-500 cursor-pointer"
              onClick={() => router.push('/settings')}
              title="Configurações"
            />
          )}
          <button
            className="flex flex-col items-center text-gray-600 hover:text-red-500"
            onClick={handleLogout}
            title="Sair"
          >
            <AiOutlineLogout size={24} />
            <span className="text-xs mt-2">Sair</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col">
        {/* Cabeçalho */}
        <header className="bg-white shadow p-4 flex justify-between items-center text-xs lg:text-sm">
          <div>
            <h1 className="font-bold text-gray-800">Nome da Empresa</h1>
            <p className="text-gray-600 hidden sm:block">
              CNPJ: 00.000.000/0000-00
            </p>
          </div>
          <div className="text-right">
            {loadingUser ? (
              <p className="text-gray-600">Carregando dados do usuário...</p>
            ) : user ? (
              <>
                <p className="text-gray-800 font-medium">{user.nome}</p>
                <p className="text-gray-600">Nível: {user.nivel}</p>
                <p className="text-gray-600 hidden sm:block">
                  Último Login:{' '}
                  {new Intl.DateTimeFormat('pt-BR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZone: 'America/Sao_Paulo',
                  }).format(new Date(user.last_login))}
                </p>
              </>
            ) : (
              <p className="text-gray-600">Carregando...</p>
            )}
          </div>
        </header>

        {/* Conteúdo do Dashboard */}
        <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Últimas Entradas: */}
          <section className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold mb-2">Últimas Entradas</h2>
            <ul>
              {entries.length > 0 ? (
                entries.map((entry, index) => (
                  <li key={index} className="border-b py-2">
                    {entry.name} - Quantidade: {entry.quantity} • Data:{' '}
                    {new Date(entry.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </li>
                ))
              ) : (
                <p className="text-gray-600">Nenhuma entrada registrada.</p>
              )}
            </ul>
          </section>
          {/* Últimas Saídas: */}
          <section className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold mb-2">Últimas Saídas</h2>
            <ul>
              {exits.length > 0 ? (
                exits.map((exit, index) => (
                  <li key={index} className="border-b py-2">
                    {exit.name} - Quantidade: {exit.quantity} • Data:{' '}
                    {new Date(exit.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </li>
                ))
              ) : (
                <p className="text-gray-600">Nenhuma saída registrada.</p>
              )}
            </ul>
          </section>
          {/* Alertas */}
          <section className="bg-white p-4 rounded shadow lg:col-span-2">
            <div className="flex items-center mb-2">
              <GrAlert className="text-yellow-600 mr-2" size={20} />
              <h2 className="text-lg font-bold">Alertas!</h2>
            </div>
            <ul>
              {alerts.length > 0 ? (
                alerts.map((alert, index) => (
                  <li key={index} className="border-b py-2 text-yellow-600">
                    {alert.name} - Estoque: {alert.quantity} (Mínimo:{' '}
                    {alert.min_stock})
                  </li>
                ))
              ) : (
                <p className="text-gray-600">Nenhum alerta no momento.</p>
              )}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
