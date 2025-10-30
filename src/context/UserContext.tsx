import { getProfile } from "../api/userApi";
import { jwtDecode } from "jwt-decode";
import {
  createContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type UserData = {
  name: string;
  username: string;
  email: string;
  avatar: string;
  id: string;
};
type UserContextType = {
  userToken: string | null;
  setUserToken: Dispatch<SetStateAction<string | null>>;
  isLoading: boolean;
  userData: UserData | null;
  setUserData: Dispatch<SetStateAction<UserData | null>>;
  logout: () => void;
};
type TokenPayload = {
  id: string;
  role: string;
  exp: number;
  iat: number;
};
export const UserContext = createContext<UserContextType | null>(null);

export function UserContextProvider({ children }: { children: ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);

  const logout = () => {
    localStorage.removeItem("token");
    setUserToken(null);
    setUserData(null);
  };

  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      console.log("Token is expired, logging out");
      logout();
      setIsLoading(false);
      return;
    }

    setUserToken(token);

    const decoded = jwtDecode<TokenPayload>(token);
    getProfile(decoded.id)
      .then((res) => {
        setUserData({
          name: res.name,
          username: res.username,
          email: res.email,
          id: decoded.id,
          avatar: res.profileImage || "",
        });

        console.log(res);
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
        // If we get a 401 error, the token is invalid
        if (error.response?.status === 401) {
          console.log("Token is invalid, logging out");
          logout();
        }
        setUserData(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <UserContext.Provider
      value={{
        userToken,
        setUserToken,
        isLoading,
        userData,
        setUserData,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
