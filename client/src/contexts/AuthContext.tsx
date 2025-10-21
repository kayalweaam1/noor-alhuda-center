import { createContext, useContext, ReactNode } from 'react';
import { trpc } from '@/lib/trpc';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  phoneNumber: string | null;
  role: 'admin' | 'teacher' | 'student' | 'assistant' | null;
  isSuperAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  phoneNumber: null,
  role: null,
  isSuperAdmin: false,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const utils = trpc.useUtils();
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const phoneNumber = user?.phone || null;
  const role = user?.role || null;
  const isSuperAdmin = user?.phone === '+972542632557';

  return (
    <AuthContext.Provider value={{ 
      user: user || null, 
      loading: isLoading, 
      phoneNumber, 
      role, 
      isSuperAdmin,
      logout: async () => {
        try {
          await logoutMutation.mutateAsync();
        } finally {
          utils.auth.me.setData(undefined, null);
          await utils.auth.me.invalidate();
        }
      },
    }}>
      {children}
    </AuthContext.Provider>
  );
}

