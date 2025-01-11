import api from './api';

interface LoginRequest {
  matricula: string;
  senha: string;
}

interface LoginResponse {
  token: string;
}

export const login = async ({ matricula, senha }: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/login', { matricula, senha });
  return response.data;
};
