import Navbar from "./components/navbar/navbar"
import Dashboard from "./pages/dashboard/dashboard"
import Login from "./pages/login/login"
import RecoveryPassword from "./pages/recoveryPassword/recoveryPassword"
import { BrowserRouter, Route, Routes } from "react-router-dom"

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} /> 
          <Route path="/rPsw" element={<RecoveryPassword />} />
          <Route path="/dshb" element={<Dashboard />} />
          <Route path="/nbr" element={<Navbar />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
