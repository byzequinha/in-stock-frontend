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

interface FormData {
  codigo_barras: string;
  nome: string;
  fornecedor: string;
  data_entrada: string;
  quantidade: string;
  custo: string;
  margem: string;
  valor_venda: string;
}

interface ProductType {
  id: string;
  barcode: string;
  name: string;
  supplier: string;
  entry_date: string;
  cost: number;
  margin: number;
  price: number;
  stock: number;
  min_stock: number;
}

interface User {
  nivel: string;
  nome: string;
  last_login: string;
}

interface ApiError {
  response?: {
    status?: number;
    data?: unknown;
  };
  message: string;
}

const ProductEntry = () => {
  const router = useRouter();
  const { token, setToken } = useAuthStore();
  const user = localStorage.getItem('user');
  const isSupervisor =
    token && user ? (JSON.parse(user) as User).nivel === 'Supervisor' : false;
  const [form, setForm] = useState<FormData>({
    codigo_barras: '',
    nome: '',
    fornecedor: '',
    data_entrada: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
    quantidade: '',
    custo: '',
    margem: '40',
    valor_venda: '',
  });
  const [loading, setLoading] = useState(false);
  const [isExistingProduct, setIsExistingProduct] = useState(false);

  // Verificar token ao carregar a página
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    } else {
      router.push('/login');
    }
  }, [setToken, router]);

  // Verificar autenticação antes de cada operação
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
    setForm((prev) => {
      const updatedForm = { ...prev, [name]: value };
      if (name === 'custo' || name === 'margem') {
        const custo = parseFloat(updatedForm.custo) || 0;
        const margem = parseFloat(updatedForm.margem) || 0;
        updatedForm.valor_venda = (custo * (1 + margem / 100)).toFixed(2);
      }
      return updatedForm;
    });
  };

  // Função de busca de produto
  const searchProduct = useCallback(
    async (barcode: string) => {
      if (!barcode || barcode.length !== 13) {
        setIsExistingProduct(false);
        return; // Retorna silenciosamente se não tiver exatamente 13 dígitos
      }

      try {
        console.log('Buscando produto com código de barras:', barcode);

        // Buscar todos os produtos e filtrar pelo código de barras
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
            fornecedor: product.supplier || '',
            margem: product.margin,
            valor_venda: product.price,
          }));
        } else {
          setIsExistingProduct(false);
          // Limpar campos do produto silenciosamente
          setForm((prevForm) => ({
            ...prevForm,
            nome: '',
            fornecedor: '',
            margem: '40',
            valor_venda: '',
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
        setIsExistingProduct(false);
      }
    },
    [token, API_BASE_URL, setForm, setIsExistingProduct],
  );

  // Debounce para evitar múltiplas chamadas
  const debouncedSearchProduct = useMemo(
    () => debounce((barcode: string) => searchProduct(barcode), 300),
    [searchProduct],
  );

  // Atualizar a busca quando o código de barras mudar
  useEffect(() => {
    debouncedSearchProduct(form.codigo_barras);
  }, [form.codigo_barras, debouncedSearchProduct]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!checkAuth()) return;

    setLoading(true);
    try {
      const barcode = form.codigo_barras.trim();

      // Primeiro verifica se é um produto existente
      if (isExistingProduct) {
        // Para produtos existentes, validar apenas quantidade e custo silenciosamente
        if (!form.quantidade || !form.custo) {
          setLoading(false);
          return;
        }
      } else {
        // Para produtos novos, validar o código de barras e outros campos
        if (!/^\d{13}$/.test(barcode)) {
          alert('Código de barras deve ter exatamente 13 dígitos.');
          setLoading(false);
          return;
        }

        if (
          !form.codigo_barras ||
          !form.nome ||
          !form.fornecedor ||
          !form.quantidade ||
          !form.custo
        ) {
          alert('Preencha todos os campos obrigatórios antes de cadastrar.');
          setLoading(false);
          return;
        }
      }

      const payload = {
        barcode: barcode,
        name: form.nome,
        supplier: form.fornecedor,
        quantity: parseInt(form.quantidade),
        cost: parseFloat(form.custo).toFixed(2), // Formato "XX.XX"
        margin: parseFloat(form.margem).toFixed(2), // Formato "XX.XX"
        price: parseFloat(form.valor_venda).toFixed(2), // Formato "XX.XX"
        stock: parseInt(form.quantidade),
        min_stock: 5,
        entry_date: new Date().toISOString(), // Incluir data de entrada
      };

      console.log('Tentando cadastrar produto com payload:', payload);

      let response;
      if (isExistingProduct) {
        // Primeiro buscar o produto para obter o ID
        const getResponse = await axios.get(`${API_BASE_URL}/api/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const existingProduct = getResponse.data.find(
          (p: ProductType) => p.barcode === barcode,
        );
        if (!existingProduct) {
          throw new Error('Produto não encontrado para atualização');
        }

        // Criar payload específico para entrada de estoque
        const entryPayload = {
          quantity: Number(payload.quantity),
          cost: Number(payload.cost),
        };

        console.log('Registrando entrada de estoque:', existingProduct.id);
        console.log(
          'Payload da entrada (detalhado):',
          JSON.stringify(entryPayload, null, 2),
        );

        try {
          // Usar endpoint específico para entrada de estoque
          response = await axios.post(
            `${API_BASE_URL}/api/products/${existingProduct.id}/entries`,
            entryPayload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
          );

          console.log('Resposta da API:', response.data);
          alert('Entrada de estoque registrada com sucesso!');

          // Limpar o formulário
          setForm({
            codigo_barras: '',
            nome: '',
            fornecedor: '',
            data_entrada: new Date().toISOString().split('T')[0],
            quantidade: '',
            custo: '',
            margem: '40',
            valor_venda: '',
          });
          setIsExistingProduct(false);
        } catch (error) {
          console.error('Erro detalhado da API:', {
            status: (error as ApiError)?.response?.status,
            data: (error as ApiError)?.response?.data,
            message: (error as Error).message,
            payload: entryPayload,
          });
          throw error;
        }
      } else {
        console.log('Criando novo produto');
        response = await axios.post(`${API_BASE_URL}/api/products`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      console.log('Resposta da API:', response.data);
      alert(
        isExistingProduct
          ? 'Produto atualizado com sucesso!'
          : 'Produto cadastrado com sucesso!',
      );

      // Limpar o formulário
      setForm({
        codigo_barras: '',
        nome: '',
        fornecedor: '',
        data_entrada: new Date().toISOString().split('T')[0],
        quantidade: '',
        custo: '',
        margem: '40',
        valor_venda: '',
      });
      setIsExistingProduct(false);
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          'Erro ao salvar produto:',
          (error as { response?: { data: unknown } }).response?.data ||
            error.message,
        );
      }
      alert('Erro ao salvar produto. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-16 bg-white shadow-lg flex flex-col items-center py-6">
        <Logo className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16" />{' '}
        <nav className="mt-10 flex flex-col space-y-6">
          <AiOutlineHome
            size={24}
            onClick={() => router.push('/dashboard')}
            title="Início"
          />
          <AiOutlineDownload
            size={24}
            onClick={() => router.push('/entries')}
            title="Entradas"
          />
          <AiOutlineUpload
            size={24}
            onClick={() => router.push('/exits')}
            title="Saídas"
          />
        </nav>
        <div className="mt-auto space-y-6">
          <AiOutlineUser
            size={24}
            onClick={() => router.push('/profile')}
            title="Perfil"
          />
          {isSupervisor && (
            <AiOutlineSetting
              size={24}
              onClick={() => router.push('/settings')}
              title="Configurações"
            />
          )}
          <button onClick={() => setToken('')} title="Sair">
            <AiOutlineLogout size={24} />
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center text-xs lg:text-sm">
          <div>
            <h1 className="font-bold text-gray-800">Nome da Empresa</h1>
            <p className="text-gray-600 hidden sm:block">
              CNPJ: 00.000.000/0000-00
            </p>
          </div>
          <div className="text-right">
            {token ? (
              <>
                <p className="text-gray-800 font-medium">
                  {user ? (JSON.parse(user) as User).nome : ''}
                </p>
                <p className="text-gray-600">
                  Nível: {user ? (JSON.parse(user) as User).nivel : ''}
                </p>
                <p className="text-gray-600 hidden sm:block">
                  Último Login:{' '}
                  {user
                    ? new Date(
                        (JSON.parse(user) as User).last_login,
                      ).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })
                    : ''}
                </p>
              </>
            ) : (
              <p className="text-gray-600">Carregando...</p>
            )}
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-4">
              Cadastro/Atualização de Produto
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              {Object.entries(form).map(([field, value]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field.replace('_', ' ').toUpperCase()}
                  </label>
                  <input
                    type={field === 'data_entrada' ? 'date' : 'text'}
                    name={field}
                    value={value}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    disabled={field === 'margem' && !isSupervisor}
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                disabled={loading}
              >
                {loading
                  ? 'Processando...'
                  : isExistingProduct
                    ? 'Atualizar Produto'
                    : 'Cadastrar Produto'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductEntry;
