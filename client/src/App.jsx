import Navbar from "./components/Navbar/Navbar"
import Dashboard from "./pages/Dashboard/Dashboard"
import Login from "./pages/Login/Login"
import Card from "./components/Cards/CardLg"
import RecoveryPassword from "./pages/RecoveryPassword/RecoveryPassword"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Materials from "./pages/Materials/Materials"
import { PrivateRoute, PublicRoute } from "./routes/routes"
import User from "./pages/User/User"
import Testing from "./pages/Testing/Testing"
import Shelves from "./pages/Shelves/Shelves"
import Deposits from "./pages/Deposits/Deposits"


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/rPsw" element={<RecoveryPassword />} />
          <Route path="/testing" element={<Testing />} />
          <Route path="/nbr" element={<Navbar />} />
          <Route path="/card" element={<Card />} />
          <Route path="/mtls" element={<PrivateRoute><Materials /></PrivateRoute>} />
          <Route path="/shelf" element={<PrivateRoute><Shelves /></PrivateRoute>} />
          <Route path="/deposit" element={<PrivateRoute><Deposits /></PrivateRoute>} />
          <Route path="/dshb" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/user" element={<PrivateRoute><User /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
