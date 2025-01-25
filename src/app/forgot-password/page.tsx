"use client";

import { useRouter } from "next/navigation";
import Logo from "../components/Logo";

const ForgotPassword = () => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-cinza">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <div className="flex justify-center mb-6">
          <Logo width={180} height={143} />
        </div>
        <h1 className="mb-4 text-2xl font-bold text-center text-preto">
          Recuperar Senha
        </h1>
        <p className="mb-6 text-center text-gray-600">
          Entre em contato com o Supervisor para redefinir sua senha.
        </p>
        <button
          className="w-full px-4 py-2 font-bold text-white bg-azul hover:bg-azul2 rounded"
          onClick={() => router.push("/login")}
        >
          Voltar para Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
