import Navbar from "./components/navbar/Navbar"
import Dashboard from "./pages/dashboard/Dashboard"
import Login from "./pages/login/Login"
import Card from "./components/cards/CardLg"
import RecoveryPassword from "./pages/recoveryPassword/RecoveryPassword"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Materials from "./pages/materials/Materials"
import PrivateRoute from "./routes/routes"
import AddUser from "./pages/addUser/AddUser"
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
