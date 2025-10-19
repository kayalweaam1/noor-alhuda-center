import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  phoneNumber: string | null;
  role: 'admin' | 'teacher' | 'student' | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  phoneNumber: null,
  role: null,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [role, setRole] = useState<'admin' | 'teacher' | 'student' | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const phone = firebaseUser.phoneNumber;
        setPhoneNumber(phone);
        
        // Determine role based on phone number
        // Admin phones
        const adminPhones = ['+972542632557', '+972506381455'];
        
        if (adminPhones.includes(phone || '')) {
          setRole('admin');
        } else {
          // For now, default to student
          // Later we'll check from database
          setRole('student');
        }
      } else {
        setPhoneNumber(null);
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, phoneNumber, role }}>
      {children}
    </AuthContext.Provider>
  );
}

