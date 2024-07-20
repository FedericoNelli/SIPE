import Navbar from "./components/navbar/navbar"
import Dashboard from "./pages/dashboard/dashboard"
import Login from "./pages/login/login"
import Card from "./components/cards/cardLg"
import RecoveryPassword from "./pages/recoveryPassword/recoveryPassword"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Materials from "./pages/materials/materials"
import PrivateRoute from "./routes/routes"
import AddUser from "./pages/addUser/addUser"
import Testing from "./pages/testing/testing"

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
