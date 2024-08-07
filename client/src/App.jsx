import Navbar from "./components/Navbar/Navbar"
import Dashboard from "./pages/Dashboard/Dashboard"
import Login from "./pages/Login/Login"
import RecoveryPassword from "./pages/RecoveryPassword/RecoveryPassword"
import RecoveryCode from "./pages/RecoveryCode/RecoveryCode"
import ChangePassword from "./pages/ChangePassword/ChangePassword"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Materials from "./pages/Materials/Materials"
import { AdminRoute, PrivateRoute, PublicRoute } from "./routes/routes"
import Users from "./pages/Users/Users"
// import Testing from "./pages/Testing/Testing"
import Shelves from "./pages/Shelves/Shelves"
import Deposits from "./pages/Deposits/Deposits"

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/rPsw" element={<RecoveryPassword />} />
          <Route path="/rCod" element={<RecoveryCode />} />
          <Route path="/chPsw" element={<ChangePassword />} />
          {/* <Route path="/testing" element={<Testing />} /> */}
          <Route path="/nbr" element={<Navbar />} />
          <Route path="/mtls" element={<PrivateRoute><Materials /></PrivateRoute>} />
          <Route path="/shelf" element={<AdminRoute><Shelves /></AdminRoute>} />
          <Route path="/deposit" element={<AdminRoute><Deposits /></AdminRoute>} />
          <Route path="/dshb" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/user" element={<PrivateRoute><Users /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;