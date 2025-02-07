'use client';

import Logo from '@/app/components/Logo';
import { useAuthStore } from '@/stores/useAuthStore';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  AiOutlineDelete,
  AiOutlineDownload,
  AiOutlineHome,
  AiOutlineLogout,
  AiOutlineReload,
  AiOutlineSearch,
  AiOutlineSetting,
  AiOutlineUpload,
  AiOutlineUser,
} from 'react-icons/ai';

interface Product {
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
  id: number;
  nome: string;
  matricula: string;
  nivel: 'Usuário' | 'Supervisor';
  last_login?: string;
}

interface UserForm {
  nome: string;
  matricula: string;
  senha: string;
  nivel: 'Usuário' | 'Supervisor';
}

interface ApiError {
  message: string;
  response?: {
    status: number;
    headers: Record<string, string>;
    data: {
      message?: string;
      error?: string;
    };
  };
  request?: XMLHttpRequest;
}

const SettingsPage = () => {
  const router = useRouter();
  const { token, user, setUser, clearAuth } = useAuthStore();
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  // Estados gerais
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('editProduct');

  // Estados para gestão de produtos
  const [searchQuery, setSearchQuery] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    codigo_barras: '',
    nome: '',
    fornecedor: '',
    custo: '',
    margem: '40',
    valor_venda: '',
    estoque: '',
    estoque_minimo: '20',
  });

  // Estados para gestão de usuários
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<UserForm>({
    nome: '',
    matricula: '',
    senha: '',
    nivel: 'Usuário',
  });

  // Verificar autenticação e nível de acesso
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (!savedToken || !savedUser) {
        clearAuth();
        router.push('/login');
        return;
      }

      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        if (parsedUser.nivel !== 'Supervisor') {
          alert(
            'Acesso negado. Apenas supervisores podem acessar esta página.',
          );
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        clearAuth();
        router.push('/login');
      }
    };

    checkAuth();
  }, [router, setUser, clearAuth]);

  // Verificar se o usuário atual é Supervisor
  const isSupervisor = user?.nivel === 'Supervisor';

  // Funções de gerenciamento de usuários
  const handleCreateUser = async () => {
    if (!userForm.nome || !userForm.matricula || !userForm.senha) {
      return alert('Preencha todos os campos obrigatórios');
    }

    if (isNaN(Number(userForm.matricula))) {
      return alert('Matrícula deve conter apenas números');
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/users`, userForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchUsers();
      setUserForm({
        nome: '',
        matricula: '',
        senha: '',
        nivel: 'Usuário',
      });
      alert('Usuário criado com sucesso!');
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erro ao criar usuário:', apiError);
      alert(apiError.response?.data?.message || 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      await axios.put(
        `${API_BASE_URL}/api/users/${selectedUser.id}`,
        userForm,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert('Usuário atualizado com sucesso!');
      fetchUsers();
      setSelectedUser(null);
      setUserForm({
        nome: '',
        matricula: '',
        senha: '',
        nivel: 'Usuário',
      });
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erro ao atualizar usuário:', apiError);
      alert(apiError.response?.data?.message || 'Erro ao atualizar usuário');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!user) {
      alert('Erro: usuário não identificado.');
      return;
    }

    if (user.id === userId) {
      alert('Você não pode excluir seu próprio usuário!');
      return;
    }

    const confirmacao = confirm('Tem certeza que deseja excluir este usuário?');
    if (!confirmacao) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.status === 200) {
        alert('Usuário excluído com sucesso!');
        await fetchUsers();
      } else {
        alert('Erro ao excluir usuário. Verifique se ele ainda existe.');
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erro ao deletar usuário:', apiError);
      alert(apiError.response?.data?.message || 'Erro ao deletar usuário');
    }
  };

  const handleResetPassword = async (userId: number) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/users/${userId}/reset-password`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert('Senha resetada com sucesso para "senha123"!');
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erro ao resetar senha:', apiError);
      alert(apiError.response?.data?.message || 'Erro ao resetar senha');
    }
  };

  // Buscar usuários (apenas para Supervisores)
  const fetchUsers = useCallback(async () => {
    if (!isSupervisor) {
      alert('Apenas Supervisores podem gerenciar usuários.');
      return;
    }

    try {
      const response = await axios.get<{ users: User[] }>(
        `${API_BASE_URL}/api/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setUsers(response.data.users || []);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erro ao buscar usuários:', apiError);
      if (apiError.response?.status === 403) {
        alert('Acesso negado: apenas Supervisores podem listar usuários.');
      } else {
        alert('Erro ao buscar usuários');
      }
    }
  }, [isSupervisor, token, API_BASE_URL]);

  // Carregar usuários ao montar o componente
  useEffect(() => {
    if (activeTab === 'users' && isSupervisor) {
      fetchUsers();
    }
  }, [activeTab, isSupervisor, fetchUsers]);

  // Handlers para produtos
  const handleSearchProduct = async () => {
    if (!searchQuery) return alert('Digite um código de barras para buscar!');

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const foundProduct = response.data.find(
        (p: Product) => p.barcode === searchQuery,
      );

      if (!foundProduct) {
        alert('Produto não encontrado!');
        setLoading(false);
        return;
      }

      console.log('Produto encontrado:', foundProduct);
      setProduct(foundProduct);
      setForm({
        codigo_barras: foundProduct.barcode || '',
        nome: foundProduct.name || '',
        fornecedor: foundProduct.supplier || '',
        custo: foundProduct.cost?.toString() || '',
        margem: foundProduct.margin?.toString() || '40',
        valor_venda: (
          parseFloat(foundProduct.cost) +
          (parseFloat(foundProduct.cost) * parseFloat(foundProduct.margin)) /
            100
        ).toFixed(2),
        estoque: foundProduct.stock?.toString() || '',
        estoque_minimo: foundProduct.min_stock?.toString() || '20',
      });
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erro ao buscar produto:', apiError);
      alert('Erro ao buscar produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!product) return alert('Nenhum produto selecionado.');

    setLoading(true);
    try {
      // Validar campos obrigatórios e formatos
      if (!form.nome.trim()) {
        alert('O nome do produto é obrigatório');
        return;
      }
      if (!form.fornecedor.trim()) {
        alert('O fornecedor é obrigatório');
        return;
      }
      if (isNaN(parseFloat(form.custo)) || parseFloat(form.custo) <= 0) {
        alert('O custo deve ser um número válido maior que zero');
        return;
      }
      if (isNaN(parseFloat(form.margem)) || parseFloat(form.margem) < 0) {
        alert('A margem deve ser um número válido maior ou igual a zero');
        return;
      }
      if (
        isNaN(parseInt(form.estoque_minimo)) ||
        parseInt(form.estoque_minimo) < 0
      ) {
        alert(
          'O estoque mínimo deve ser um número válido maior ou igual a zero',
        );
        return;
      }

      // Converter e validar os valores numéricos
      const cost = Number(form.custo);
      const margin = Number(form.margem);
      const minStock = Number(form.estoque_minimo);

      // Calcular o preço baseado no custo e margem
      const price = cost + (cost * margin) / 100;

      // Payload apenas com os campos que o endpoint PUT espera
      const payload = {
        name: form.nome.trim(),
        price: Number(price.toFixed(2)),
        stock: product.stock,
        min_stock: minStock,
      };

      console.log('Payload a ser enviado:', payload);

      const response = await axios.put(
        `${API_BASE_URL}/api/products/${product.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Resposta do servidor:', response.data);
      alert('Produto atualizado com sucesso!');

      setProduct(null);
      setForm({
        codigo_barras: '',
        nome: '',
        fornecedor: '',
        custo: '',
        margem: '40',
        valor_venda: '',
        estoque: '',
        estoque_minimo: '20',
      });
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erro ao atualizar produto:', apiError);

      if (apiError.response?.data) {
        const errorMessage =
          apiError.response.data.message ||
          apiError.response.data.error ||
          'Verifique os dados e tente novamente.';
        alert(`Erro ao atualizar produto: ${errorMessage}`);
      } else {
        alert('Erro ao atualizar produto. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateSellingPrice = (cost: string, margin: string) => {
    const costValue = parseFloat(cost) || 0;
    const marginValue = parseFloat(margin) || 0;
    return (costValue + (costValue * marginValue) / 100).toFixed(2);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const newForm = { ...prev, [name]: value };

      // Se mudou o custo ou a margem, recalcula o valor de venda
      if (name === 'custo' || name === 'margem') {
        newForm.valor_venda = calculateSellingPrice(
          name === 'custo' ? value : prev.custo,
          name === 'margem' ? value : prev.margem,
        );
      }

      return newForm;
    });
  };

  // Renderização
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Menu lateral */}
      <aside className="w-16 bg-white shadow-lg flex flex-col items-center py-6">
        <Logo className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16" />
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
          <AiOutlineSetting
            size={24}
            className="text-blue-500 cursor-pointer"
            title="Configurações"
          />
          <button
            className="flex flex-col items-center text-gray-600 hover:text-red-500"
            onClick={() => {
              clearAuth();
              router.push('/login');
            }}
            title="Sair"
          >
            <AiOutlineLogout size={24} />
            <span className="text-xs mt-2">Sair</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Nome da Empresa
            </h1>
            <p className="text-sm text-gray-600">CNPJ: 00.000.000/0000-00</p>
          </div>
          <div className="text-right">
            {!user ? (
              <p className="text-gray-600">Carregando...</p>
            ) : (
              <>
                <p className="text-gray-800 font-medium">{user.nome}</p>
                <p className="text-gray-600">Nível: {user.nivel}</p>
                <p className="text-gray-600 hidden sm:block">
                  Último Login:{' '}
                  {user.last_login
                    ? new Intl.DateTimeFormat('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      }).format(new Date(user.last_login))
                    : 'Nunca'}
                </p>
              </>
            )}
          </div>
        </header>

        {/* Abas e conteúdo */}
        <div className="p-6">
          <nav className="border-b border-gray-300 mb-6">
            <div className="flex space-x-4">
              {['editProduct', 'users', 'feature'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-4 ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-500 font-bold text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'editProduct' && 'Editar Produto'}
                  {tab === 'users' && 'Usuários'}
                  {tab === 'feature' && 'Feature'}
                </button>
              ))}
            </div>
          </nav>

          {/* Conteúdo da aba Editar Produto */}
          {activeTab === 'editProduct' && (
            <div className="space-y-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Código de Barras"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 p-2 border rounded-lg"
                />
                <button
                  onClick={handleSearchProduct}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  disabled={loading}
                >
                  <AiOutlineSearch /> Buscar
                </button>
              </div>

              {product && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-bold mb-4">Editar Produto</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(form).map(([field, value]) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.replace(/_/g, ' ').toUpperCase()}
                        </label>
                        <input
                          type="text"
                          name={field}
                          value={value}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md"
                          disabled={
                            field === 'valor_venda' ||
                            field === 'codigo_barras' ||
                            field === 'estoque'
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleSaveProduct}
                    className="mt-4 bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Conteúdo da aba Usuários */}
          {activeTab === 'users' && isSupervisor && (
            <div className="space-y-4">
              {/* Lista de Usuários */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Nome
                        </th>
                        <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Matrícula
                        </th>
                        <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Nível
                        </th>
                        <th className="px-2 sm:px-4 py-2 text-right text-xs font-medium text-gray-500">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-xs text-gray-900">
                            {user.nome}
                          </td>
                          <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-xs text-gray-900">
                            {user.matricula}
                          </td>
                          <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-xs text-gray-900">
                            {user.nivel}
                          </td>
                          <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-right text-xs space-x-1 sm:space-x-2">
                            <button
                              onClick={() =>
                                handleResetPassword(Number(user.id))
                              }
                              className="text-yellow-600 hover:text-yellow-800"
                              title="Redefinir Senha"
                            >
                              <AiOutlineReload size={20} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Excluir Usuário"
                            >
                              <AiOutlineDelete size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Formulário de Usuário */}
              <div className="bg-white rounded-lg shadow p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3">
                  {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={userForm.nome}
                      onChange={(e) =>
                        setUserForm({ ...userForm, nome: e.target.value })
                      }
                      className="w-full text-xs sm:text-sm p-2 border rounded-md"
                      placeholder="Nome do usuário"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Matrícula
                    </label>
                    <input
                      type="text"
                      value={userForm.matricula}
                      onChange={(e) =>
                        setUserForm({ ...userForm, matricula: e.target.value })
                      }
                      className="w-full text-xs sm:text-sm p-2 border rounded-md"
                      placeholder="Matrícula"
                    />
                  </div>
                  {!selectedUser && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Senha
                      </label>
                      <input
                        type="password"
                        value={userForm.senha}
                        onChange={(e) =>
                          setUserForm({ ...userForm, senha: e.target.value })
                        }
                        className="w-full text-xs sm:text-sm p-2 border rounded-md"
                        placeholder="Senha"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nível
                    </label>
                    <select
                      value={userForm.nivel}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          nivel: e.target.value as 'Usuário' | 'Supervisor',
                        })
                      }
                      className="w-full text-xs sm:text-sm p-2 border rounded-md"
                    >
                      <option value="Usuário">Usuário</option>
                      <option value="Supervisor">Supervisor</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={selectedUser ? handleUpdateUser : handleCreateUser}
                  className="mt-4 w-full sm:w-auto bg-blue-500 text-white px-4 py-2 text-xs sm:text-sm rounded-md hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading
                    ? selectedUser
                      ? 'Atualizando...'
                      : 'Criando...'
                    : selectedUser
                      ? 'Atualizar'
                      : 'Criar'}
                </button>
              </div>
            </div>
          )}

          {/* Conteúdo da aba Feature */}
          {activeTab === 'feature' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">
                Recurso em Desenvolvimento
              </h2>
              <p className="text-gray-600">
                Estamos trabalhando nesta funcionalidade. Volte em breve!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
