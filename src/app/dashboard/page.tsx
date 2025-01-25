'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';
import Logo from '../components/Logo';
import { AiOutlineHome, AiOutlineSetting, AiOutlineUser, AiOutlineLogout } from 'react-icons/ai';
import { useIdleTimeout } from '../hooks/useIdleTimeout';

interface User {
  nome: string;
  nivel: string;
  last_login: string;
}

interface Product {
  id: number;
  name: string;
  price: number | string;
  stock: number;
  min_stock: number;
}

const Dashboard = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const { token, setToken } = useAuthStore();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  const handleLogout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('token');
    router.push('/login');
  }, [router, setToken]);

  const fetchUserDetails = useCallback(async () => {
    if (!token) {
      handleLogout();
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error);
      handleLogout();
    } finally {
      setLoadingUser(false);
    }
  }, [API_BASE_URL, token, handleLogout]);

  const fetchProducts = useCallback(async () => {
    if (!token) {
      handleLogout();
      return;
    }

    try {
      const response = await axios.get<Product[]>(`${API_BASE_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoadingProducts(false);
    }
  }, [API_BASE_URL, token, handleLogout]);

  useIdleTimeout({
    timeout: 15 * 60 * 1000, // 15 minutos
    onTimeout: handleLogout,
  });

  useEffect(() => {
    if (!token) {
      handleLogout();
    } else {
      fetchUserDetails();
      fetchProducts();
    }
  }, [token, fetchUserDetails, fetchProducts, handleLogout]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Cabeçalho Superior */}
      <header className="flex items-center justify-between bg-white shadow p-4 w-full">
        <div className="flex items-center space-x-4">
        <Logo className="w-12 h-8 sm:w-16 sm:h-10 lg:w-20 lg:h-14" />
        <div>
            <h1 className="text-xl font-bold text-gray-800">Nome da Empresa</h1>
            <p className="text-sm text-gray-600">CNPJ: 00.000.000/0000-00</p>
          </div>
        </div>
        <div className="text-right">
          {loadingUser ? (
            <p>Carregando informações do usuário...</p>
          ) : user ? (
            <>
              <p className="text-gray-800 font-medium">Usuário: {user.nome}</p>
              <p className="text-sm text-gray-600">Nível: {user.nivel}</p>
              <p className="text-sm text-gray-600">
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
            <p className="text-red-500">Erro ao carregar informações do usuário.</p>
          )}
        </div>
      </header>

      {/* Estrutura Principal */}
      <div className="flex flex-1">
        {/* Menu Lateral */}
        <aside className="w-20 bg-white shadow-lg flex flex-col items-center py-6 min-h-full">
          <AiOutlineHome size={24} className="mb-6 text-gray-600 hover:text-blue-500 cursor-pointer" />
          <AiOutlineSetting size={24} className="mb-6 text-gray-600 hover:text-blue-500 cursor-pointer" />
          <AiOutlineUser size={24} className="mb-6 text-gray-600 hover:text-blue-500 cursor-pointer" />
          <div className="mt-auto">
            <button
              className="flex flex-col items-center text-gray-600 hover:text-red-500"
              onClick={handleLogout}
            >
              <AiOutlineLogout size={24} />
              <span className="text-xs mt-2">Sair</span>
            </button>
          </div>
        </aside>

        {/* Conteúdo Principal */}
        <main className="flex-1 p-6 overflow-auto">
          <h2 className="text-2xl font-bold text-gray-800">Bem-vindo à Dashboard</h2>
          {loadingProducts ? (
            <p className="text-gray-600 mt-4">Carregando produtos...</p>
          ) : products.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white p-4 rounded shadow">
                  <h3 className="text-lg font-bold">{product.name}</h3>
                  <p>Estoque: {product.stock}</p>
                  <p>
                    Preço:{' '}
                    {isNaN(Number(product.price)) ? 'Preço inválido' : `R$ ${Number(product.price).toFixed(2)}`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 mt-4">Nenhum produto encontrado.</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
