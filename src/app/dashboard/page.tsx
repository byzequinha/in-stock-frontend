"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Logo from '../components/Logo';
import { AiOutlineHome, AiOutlineSetting, AiOutlineUser, AiOutlineLogout } from 'react-icons/ai';
import useIdleTimeout from '../hooks/useIdleTimeout'; // Hook para inatividade

const Dashboard = () => {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove o token
        router.push('/login'); // Redireciona para a página de login
    };

    // Configuração do tempo de inatividade
    useIdleTimeout({
        timeout: 15 * 60 * 1000, // 15 minutos
        onTimeout: handleLogout,
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Cabeçalho Superior */}
            <header className="flex items-center justify-between bg-white shadow p-4">
                <div className="flex items-center space-x-4">
                    <Logo width={100} height={80} />
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Nome da Empresa</h1>
                        <p className="text-sm text-gray-600">CNPJ: 00.000.000/0000-00</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-gray-800 font-medium">Usuário: João da Silva</p>
                    <p className="text-sm text-gray-600">Nível: Colaborador</p>
                </div>
            </header>

            {/* Linha Divisória */}
            <div className="border-t border-gray-200"></div>

            {/* Menus Horizontais */}
            <div className="flex justify-between items-center bg-white shadow p-4">
                <nav className="flex space-x-6">
                    <a href="#" className="text-gray-700 hover:text-blue-500">Menu 1</a>
                    <a href="#" className="text-gray-700 hover:text-blue-500">Menu 2</a>
                    <a href="#" className="text-gray-700 hover:text-blue-500">Menu 3</a>
                </nav>
            </div>

            {/* Estrutura Principal */}
            <div className="flex">
                {/* Menu Lateral (Aside) */}
                <aside className="w-20 bg-white shadow-lg flex flex-col items-center py-6 min-h-[calc(100vh-132px)]">
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
                <main className="flex-1 p-6">
                    <h2 className="text-2xl font-bold text-gray-800">Bem-vindo à Dashboard</h2>
                    <p className="mt-4 text-gray-600">
                        Aqui você pode acessar funcionalidades rápidas e informações importantes.
                    </p>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
