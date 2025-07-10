// src/api/auth.ts

const TOKEN_KEY = 'jwtToken'; // Centralize the token key

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const login = async (username: string, password: string): Promise<{ success: boolean; message?: string; token?: string }> => {
  try {
    const response = await fetch('/login', { // Relative path handled by Nginx
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok && data.token) {
      setToken(data.token);
      return { success: true, token: data.token };
    } else {
      return { success: false, message: data.message || 'Erro ao fazer login' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Erro de conexão. Verifique se o servidor está rodando.' };
  }
};

export const register = async (username: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await fetch('/register', { // Relative path handled by Nginx
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: 'Registro realizado com sucesso! Faça login para continuar.' };
    } else {
      return { success: false, message: data.message || 'Erro ao registrar' };
    }
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, message: 'Erro de conexão. Verifique se o servidor está rodando.' };
  }
};