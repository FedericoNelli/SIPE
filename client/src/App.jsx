import Navbar from "./components/Navbar/Navbar"
import Dashboard from "./pages/Dashboard/Dashboard"
import Login from "./pages/Login/Login"
import Card from "./components/Cards/CardLg"
import RecoveryPassword from "./pages/RecoveryPassword/RecoveryPassword"
import RecoveryCode from "./pages/RecoveryCode/RecoveryCode"
import ChangePassword from "./pages/ChangePassword/ChangePassword"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Materials from "./pages/Materials/Materials"
import { PrivateRoute, PublicRoute, AdminRoute } from "./routes/routes"
import AddUser from "./pages/AddUser/AddUser"
import Testing from "./pages/Testing/Testing"



function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/rPsw" element={<RecoveryPassword />} />
          <Route path="/rCod" element={<RecoveryCode />} />
          <Route path="/chPsw" element={<ChangePassword />} />
          <Route path="/testing" element={<Testing />} />
          <Route path="/nbr" element={<Navbar />} />
          <Route path="/card" element={<Card />} />
          <Route path="/mtls" element={<PrivateRoute><Materials /></PrivateRoute>} />
          <Route path="/dshb" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/add" element={<PrivateRoute><AddUser /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
