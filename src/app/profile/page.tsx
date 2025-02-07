'use client';

import Logo from '@/app/components/Logo';
import { useAuthStore } from '@/stores/useAuthStore';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  AiOutlineDownload,
  AiOutlineHome,
  AiOutlineLogout,
  AiOutlineSetting,
  AiOutlineUpload,
  AiOutlineUser,
} from 'react-icons/ai';

type UserLevel = 'Usuário' | 'Supervisor';

interface UserProfile {
  id: number;
  nome: string;
  matricula: string;
  nivel: UserLevel;
  last_login?: string;
}

const isApiError = (
  error: unknown,
): error is {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
} => {
  return typeof error === 'object' && error !== null && 'response' in error;
};

const Profile = () => {
  const router = useRouter();
  const { token, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
  });
  const [passwordData, setPasswordData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmSenha: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  // Função para decodificar o token JWT
  const decodeToken = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload) as {
        id: number;
        matricula: string;
        nivel: UserLevel;
        nome: string;
        iat: number;
        exp: number;
      };
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  };

  // Carregar dados do usuário
  useEffect(() => {
    let mounted = true;

    const fetchUserData = async () => {
      if (!token) {
        console.warn('Token não encontrado, redirecionando...');
        router.push('/login');
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!mounted) return;

        const userData = response.data;
        console.log('Dados do usuário:', userData);

        // Extrair matrícula do token
        const tokenData = decodeToken(token);
        const matricula = tokenData?.matricula || '-';

        // Combinar dados atualizados com a matrícula do token
        const userWithMatricula: UserProfile = {
          ...userData,
          matricula,
        };

        setUser(userWithMatricula);
        setFormData({
          nome: userWithMatricula.nome || '',
        });
      } catch (error) {
        if (!mounted) return;
        console.error('Erro ao carregar dados do usuário:', error);
        if (isApiError(error) && error.response?.status === 401) {
          clearAuth();
          router.push('/login');
        } else {
          setError('Erro ao carregar seus dados. Tente novamente.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      mounted = false;
    };
  }, [token, API_BASE_URL, router, clearAuth]);

  // Se não houver token, redireciona para login
  useEffect(() => {
    if (!token && !loading) {
      router.push('/login');
    }
  }, [token, loading, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'form' | 'password',
  ) => {
    const { name, value } = e.target;
    if (type === 'form') {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setPasswordData((prev) => ({ ...prev, [name]: value }));
    }
    // Limpar mensagens ao digitar
    setError('');
    setSuccess('');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (!token || !user?.id) {
      router.push('/login');
      return;
    }

    const currentToken = token;

    try {
      // Atualizar nome do usuário
      await axios.put(
        `${API_BASE_URL}/api/users/${user.id}`,
        {
          nome: formData.nome,
        },
        { headers: { Authorization: `Bearer ${currentToken}` } },
      );
      setSuccess('Nome atualizado com sucesso!');

      // Atualizar dados do usuário
      const response = await axios.get(`${API_BASE_URL}/api/auth/user`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      // Extrair matrícula do token e garantir que é uma string
      const tokenData = decodeToken(currentToken);
      const matricula = tokenData?.matricula || '-';

      // Combinar dados atualizados com a matrícula do token
      const updatedUserData: UserProfile = {
        ...response.data,
        matricula,
      };

      setUser(updatedUserData);
    } catch (error) {
      console.error('Erro ao atualizar nome:', error);

      if (isApiError(error)) {
        if (error.response?.status === 401) {
          clearAuth();
          router.push('/login');
          return;
        }

        setError(
          error.response?.data?.message ||
            'Erro ao atualizar nome. Verifique os dados e tente novamente.',
        );
      } else {
        setError('Erro ao atualizar nome. Tente novamente mais tarde.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (!token || !user?.id) {
      router.push('/login');
      return;
    }

    if (passwordData.novaSenha !== passwordData.confirmSenha) {
      setError('As senhas não correspondem.');
      setSaving(false);
      return;
    }

    const currentToken = token;

    try {
      await axios.put(
        `${API_BASE_URL}/api/users/${user.id}/password`,
        {
          senhaAtual: passwordData.senhaAtual,
          novaSenha: passwordData.novaSenha,
        },
        { headers: { Authorization: `Bearer ${currentToken}` } },
      );
      setSuccess('Senha atualizada com sucesso!');
      setPasswordData({
        senhaAtual: '',
        novaSenha: '',
        confirmSenha: '',
      });
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);

      if (isApiError(error)) {
        if (error.response?.status === 401) {
          clearAuth();
          router.push('/login');
          return;
        }

        setError(
          error.response?.data?.message ||
            'Erro ao atualizar senha. Verifique os dados e tente novamente.',
        );
      } else {
        setError('Erro ao atualizar senha. Tente novamente mais tarde.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

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
            className="text-blue-500 cursor-pointer"
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

      {/* Conteúdo Principal */}
      <div className="flex-1">
        {/* Cabeçalho */}
        <header className="bg-white shadow p-4 flex justify-between items-center text-xs lg:text-sm">
          <div>
            <h1 className="font-bold text-gray-800">Nome da Empresa</h1>
            <p className="text-gray-600 hidden sm:block">
              CNPJ: 00.000.000/0000-00
            </p>
          </div>
          <div className="text-right">
            {loading ? (
              <p className="text-gray-600">Carregando dados do usuário...</p>
            ) : user ? (
              <>
                <p className="text-gray-800 font-medium">{user.nome}</p>
                <p className="text-gray-600">Nível: {user.nivel}</p>
                <p className="text-gray-600 hidden sm:block">
                  Último Login:{' '}
                  {user.last_login
                    ? new Intl.DateTimeFormat('pt-BR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        timeZone: 'America/Sao_Paulo',
                      }).format(new Date(user.last_login))
                    : 'Nunca'}
                </p>
              </>
            ) : (
              <p className="text-gray-600">Carregando...</p>
            )}
          </div>
        </header>

        {/* Conteúdo da Página */}
        <div className="p-4">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Título da Página */}
            <header className="bg-white p-6 rounded-lg shadow-sm">
              <h1 className="text-2xl font-bold text-gray-800">Meu Perfil</h1>
              <p className="text-gray-600 mt-2">
                Gerencie suas informações pessoais
              </p>
            </header>

            {/* Alertas */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <p className="text-green-700">{success}</p>
              </div>
            )}

            {/* Informações do Usuário */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Informações Básicas
              </h2>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Matrícula
                  </label>
                  <input
                    type="text"
                    value={user?.matricula || '-'}
                    className="w-full p-2 border rounded-md bg-gray-50 text-gray-700"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange(e, 'form')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nível de Acesso
                  </label>
                  <input
                    type="text"
                    value={user?.nivel || ''}
                    className="w-full p-2 border rounded-md bg-gray-50"
                    disabled
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </form>
            </section>

            {/* Alterar Senha */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Alterar Senha
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    name="senhaAtual"
                    value={passwordData.senhaAtual}
                    onChange={(e) => handleInputChange(e, 'password')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    name="novaSenha"
                    value={passwordData.novaSenha}
                    onChange={(e) => handleInputChange(e, 'password')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    name="confirmSenha"
                    value={passwordData.confirmSenha}
                    onChange={(e) => handleInputChange(e, 'password')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
