'use client';

import Logo from '@/app/components/Logo';
import { useAuthStore } from '@/stores/useAuthStore';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/navigation';
import type { ChangeEvent, FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AiOutlineDownload,
  AiOutlineHome,
  AiOutlineLogout,
  AiOutlineSetting,
  AiOutlineUpload,
  AiOutlineUser,
} from 'react-icons/ai';

interface ProductType {
  id: string;
  barcode: string;
  name: string;
  stock: number;
}

interface FormData {
  codigo_barras: string;
  nome: string;
  data_saida: string;
  quantidade: string;
  saldo_atual: string;
}

const ProductExit = () => {
  const router = useRouter();
  const { token, setToken } = useAuthStore();
  const user = localStorage.getItem('user');
  const isSupervisor =
    token && user
      ? (JSON.parse(user) as { nivel: string }).nivel === 'Supervisor'
      : false;
  const [form, setForm] = useState<FormData>({
    codigo_barras: '',
    nome: '',
    data_saida: new Date().toISOString().split('T')[0],
    quantidade: '',
    saldo_atual: '',
  });
  const [loading, setLoading] = useState(false);
  const [isExistingProduct, setIsExistingProduct] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    } else {
      router.push('/login');
    }
  }, [setToken, router]);

  const checkAuth = () => {
    if (!token) {
      alert('Sessão expirada. Por favor, faça login novamente.');
      router.push('/login');
      return false;
    }
    return true;
  };

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/auth/user`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
          }
        } catch (error) {
          if (error instanceof Error) {
            console.error('Erro ao carregar dados do usuário', error.message);
          }
        }
      }
    };
    fetchUser();
  }, [token, API_BASE_URL]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const searchProduct = useCallback(
    async (barcode: string) => {
      if (!barcode || barcode.length !== 13) {
        setIsExistingProduct(false);
        return;
      }

      try {
        console.log('Buscando produto com código de barras:', barcode);

        const response = await axios.get(`${API_BASE_URL}/api/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const product = response.data.find(
          (p: ProductType) => p.barcode === barcode,
        );
        if (product) {
          console.log('Produto encontrado:', product);
          setIsExistingProduct(true);
          setForm((prevForm) => ({
            ...prevForm,
            nome: product.name,
            saldo_atual: product.stock.toString(),
          }));
        } else {
          console.log('Produto não encontrado');
          setIsExistingProduct(false);
          setForm((prevForm) => ({
            ...prevForm,
            nome: '',
            saldo_atual: '',
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
        setIsExistingProduct(false);
      }
    },
    [API_BASE_URL, token],
  );

  const debouncedSearchProduct = useMemo(
    () => debounce((barcode: string) => searchProduct(barcode), 300),
    [searchProduct],
  );

  useEffect(() => {
    debouncedSearchProduct(form.codigo_barras);
  }, [form.codigo_barras, debouncedSearchProduct]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!checkAuth()) return;

    setLoading(true);
    try {
      const barcode = form.codigo_barras.trim();

      if (isExistingProduct) {
        if (!form.quantidade) {
          setLoading(false);
          return;
        }

        try {
          const getResponse = await axios.get(`${API_BASE_URL}/api/products`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const existingProduct = getResponse.data.find(
            (p: ProductType) => p.barcode === barcode,
          );

          if (!existingProduct) {
            throw new Error('Produto não encontrado para atualização');
          }

          const saldoAtual = parseInt(form.saldo_atual, 10);
          const quantidadeSaida = parseInt(form.quantidade, 10);

          if (quantidadeSaida > saldoAtual) {
            throw new Error('Quantidade de saída maior que o saldo atual');
          }

          const payload = {
            quantity: quantidadeSaida,
          };

          console.log('Registrando saída de estoque:', existingProduct.id);
          console.log(
            'Payload da saída (detalhado):',
            JSON.stringify(payload, null, 2),
          );

          await axios.post(
            `${API_BASE_URL}/api/products/${existingProduct.id}/sale`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
          );

          alert('Saída registrada com sucesso!');

          setForm({
            codigo_barras: '',
            nome: '',
            data_saida: new Date().toISOString().split('T')[0],
            quantidade: '',
            saldo_atual: '',
          });
          setIsExistingProduct(false);
        } catch (error) {
          console.error('Erro detalhado da API:', error);
          if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.message || error.message;
            console.error('Erro completo:', error.response?.data);
            alert(`Erro ao registrar saída: ${errorMessage}`);
          } else if (error instanceof Error) {
            alert(`Erro ao registrar saída: ${error.message}`);
          } else {
            alert(
              'Erro ao registrar saída. Verifique os dados e tente novamente.',
            );
          }
        }
      } else {
        alert('Produto não encontrado. Verifique o código de barras.');
      }
    } catch (error) {
      console.error('Erro ao registrar saída:', error);
      alert('Erro ao registrar saída. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Menu Lateral */}
      <aside className="w-16 bg-white shadow-lg flex flex-col items-center py-6">
        <Logo className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16" />
        <nav className="mt-10 flex flex-col space-y-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Início"
          >
            <AiOutlineHome size={24} />
          </button>
          <button
            onClick={() => router.push('/entries')}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Entradas"
          >
            <AiOutlineDownload size={24} />
          </button>
          <button
            onClick={() => router.push('/exits')}
            className="p-2 hover:bg-gray-100 rounded-lg bg-blue-100"
            title="Saídas"
          >
            <AiOutlineUpload size={24} />
          </button>
        </nav>
        <div className="mt-auto space-y-6">
          <button
            onClick={() => router.push('/profile')}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Perfil"
          >
            <AiOutlineUser size={24} />
          </button>
          {isSupervisor && (
            <button
              onClick={() => router.push('/settings')}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Configurações"
            >
              <AiOutlineSetting size={24} />
            </button>
          )}
          <button
            onClick={() => {
              setToken('');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.push('/login');
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Sair"
          >
            <AiOutlineLogout size={24} />
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center text-xs lg:text-sm">
          <div>
            <h1 className="font-bold text-gray-800">Nome da Empresa</h1>
            <p className="text-gray-600 hidden sm:block">
              CNPJ: 00.000.000/0000-00
            </p>
          </div>
          <div className="text-right">
            {!user ? (
              <p className="text-gray-600">Carregando...</p>
            ) : (
              <>
                <p className="text-gray-800 font-medium">
                  {(JSON.parse(user) as { nome: string }).nome}
                </p>
                <p className="text-gray-600">
                  Nível: {(JSON.parse(user) as { nivel: string }).nivel}
                </p>
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
                  }).format(
                    new Date(
                      (JSON.parse(user) as { last_login: string }).last_login,
                    ),
                  )}
                </p>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-4">Registro de Saída</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              {Object.entries(form).map(([field, value]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field.replace(/_/g, ' ').toUpperCase()}
                  </label>
                  <input
                    type={field === 'data_saida' ? 'date' : 'text'}
                    name={field}
                    value={value}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    readOnly={field === 'nome' || field === 'saldo_atual'}
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={loading || !isExistingProduct}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading || !isExistingProduct
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {loading ? 'Registrando...' : 'Registrar Saída'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductExit;
