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
  username:string;
  email: string;
  avatar: string;
  id:string;
};
type UserContextType = {
  userToken: string | null;
  setUserToken: Dispatch<SetStateAction<string | null>>;
  isLoading: boolean;
  userData:UserData|null
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
  const [userData, setUserData] = useState<UserData|null>(null);

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
          username :res.username,
          email: res.email,
          id:decoded.id
          ,
          avatar: res.profileImage || (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-circle-user-round-icon lucide-circle-user-round"
            >
              <path d="M18 20a6 6 0 0 0-12 0" />
              <circle cx="12" cy="10" r="4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          ),
        });
      
        console.log(res)
      })
      .catch(() => setUserData(null))
      .finally(() => setIsLoading(false));
  }, []);
  return (
    <UserContext.Provider value={{ userToken, setUserToken, isLoading ,userData ,setUserData}}>
      {children}
    </UserContext.Provider>
  );
}
