import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import  {Layout} from "./components/Layout/Layout"
import { HomePage } from "./pages/HomePage/HomePage"
import { Explore } from "./pages/explore"
import { Profile } from "./pages/profile"
import { Bookmarks } from "./pages/bookmarks"
import { Communities } from "./pages/communities"
import { Trending } from "./pages/trending"
import { Settings } from "./pages/settings"
import "./App.css"
import { UserContextProvider } from "./context/UserContext"
import LoginPage from "./pages/LoginPage/LoginPage"
import RegisterPage from "./pages/RegisterPage/RegisterPage"
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute"

function App() {
  return (
    <UserContextProvider>
      <ThemeProvider defaultTheme="system"  storageKey="space-ui-theme">
    <Router>
        
      
          <Routes  >
            <Route element={ <ProtectedRoute><Layout/></ProtectedRoute> }>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/settings" element={<Settings />} />
            </Route>
          
            <Route path="/login" element={<LoginPage/>} />
            <Route path="/register" element={<RegisterPage/>} />
          </Routes>
    
      </Router>
    </ThemeProvider>
    </UserContextProvider>
   
  )
}

export default App
