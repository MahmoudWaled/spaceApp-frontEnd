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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
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
      .catch(() => setUserData(null))
      .finally(() => setIsLoading(false));
  }, []);
  return (
    <UserContext.Provider
      value={{ userToken, setUserToken, isLoading, userData, setUserData }}
    >
      {children}
    </UserContext.Provider>
  );
}
