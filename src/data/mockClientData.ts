export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  userId: string; // ID do usuário que criou este cliente
  createdAt: string;
}

export interface PlatformUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'client';
  createdAt: string;
}

// Mock clients data
export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Empresa ABC Ltda',
    phone: '(11) 99999-1111',
    email: 'contato@empresaabc.com',
    userId: '2',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Loja XYZ',
    phone: '(11) 88888-2222',
    email: 'vendas@lojaxyz.com',
    userId: '2',
    createdAt: '2024-01-20'
  },
  {
    id: '3',
    name: 'Restaurante 123',
    phone: '(11) 77777-3333',
    email: 'contato@restaurante123.com',
    userId: '2',
    createdAt: '2024-02-01'
  }
];

// Mock platform users
export const mockPlatformUsers: PlatformUser[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    email: 'client@example.com',
    name: 'Cliente Demo',
    role: 'client',
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    email: 'joao@marketing.com',
    name: 'João Silva',
    role: 'client',
    createdAt: '2024-01-12'
  }
];

// Helper functions for mock data manipulation
export const getClientsByUserId = (userId: string): Client[] => {
  return mockClients.filter(client => client.userId === userId);
};

export const addClient = (client: Omit<Client, 'id' | 'createdAt'>): Client => {
  const newClient: Client = {
    ...client,
    id: Date.now().toString(),
    createdAt: new Date().toISOString().split('T')[0]
  };
  mockClients.push(newClient);
  return newClient;
};

export const deleteClient = (clientId: string): boolean => {
  const index = mockClients.findIndex(client => client.id === clientId);
  if (index > -1) {
    mockClients.splice(index, 1);
    return true;
  }
  return false;
};

export const addPlatformUser = (user: Omit<PlatformUser, 'id' | 'createdAt'>): PlatformUser => {
  const newUser: PlatformUser = {
    ...user,
    id: Date.now().toString(),
    createdAt: new Date().toISOString().split('T')[0]
  };
  mockPlatformUsers.push(newUser);
  return newUser;
};

export const deletePlatformUser = (userId: string): boolean => {
  const index = mockPlatformUsers.findIndex(user => user.id === userId);
  if (index > -1) {
    mockPlatformUsers.splice(index, 1);
    return true;
  }
  return false;
};