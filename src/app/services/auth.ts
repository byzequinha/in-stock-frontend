"use client";

export interface LoginResponse {
  token: string; // Adapte conforme a estrutura de resposta do backend
}

export const login = async ({
  matricula,
  senha,
}: {
  matricula: string;
  senha: string;
}): Promise<LoginResponse> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ matricula, senha }),
  });

  if (!response.ok) {
    throw new Error("Credenciais inválidas");
  }

  // Retorna o JSON tipado como `LoginResponse`
  return response.json();
};
