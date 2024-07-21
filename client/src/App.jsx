import Navbar from "./components/Navbar/Navbar"
import Dashboard from "./pages/Dashboard/Dashboard"
import Login from "./pages/Login/Login"
import Card from "./components/Cards/CardLg"
import RecoveryPassword from "./pages/RecoveryPassword/RecoveryPassword"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Materials from "./pages/Materials/Materials"
import PrivateRoute from "./routes/routes"
import AddUser from "./pages/AddUser/AddUser"
import Testing from "./pages/testing/Testing"

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} /> 
          <Route path="/rPsw" element={<RecoveryPassword />} />
          <Route path="/testing" element={<Testing />} />
          <Route path="/nbr" element={<Navbar />} />
          <Route path="/card" element={<Card />} />
          <Route path="/mtls" element={<Materials />} />
          <Route 
                    path="/dshb" 
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } 
                />
          <Route 
                    path="/add" 
                    element={
                        <PrivateRoute>
                            <AddUser />
                        </PrivateRoute>
                    } 
                />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
