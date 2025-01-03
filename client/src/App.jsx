import Navbar from "./components/Sides/Navbar/Navbar"
import Dashboard from "./pages/Dashboard/dashboard"
import Login from "./pages/Login/login"
import RecoveryPassword from "./pages/RecoveryPassword/RecoveryPassword"
import RecoveryCode from "./pages/RecoveryCode/RecoveryCode"
import ChangePassword from "./pages/ChangePassword/ChangePassword"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Materials from "./pages/Materials/Materials"
import { AdminRoute, PrivateRoute, PublicRoute } from "./routes/routes"
import Users from "./pages/Users/Users"
import CompTesting from "./components/Testing/CompTesting"
import Shelves from "./pages/Shelves/Shelves"
import Aisles from "./pages/Aisles/Aisles"
import Deposits from "./pages/Deposits/Deposits"
import Locations from "./pages/Locations/Locations"
import Movements from "./pages/Movements/Movements"
import Categories from "./pages/Categories/Categories"
import Tutorials from "./pages/Tutorials/Tutorials"
import Reports from "./pages/Reports/Reports"
import Exits from "./pages/Exits/Exits"
import Audits from "./pages/Audits/Audits"


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/rPsw" element={<RecoveryPassword />} />
          <Route path="/rCod" element={<RecoveryCode />} />
          <Route path="/chPsw" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
          <Route path="/testing" element={<CompTesting />} />
          <Route path="/nbr" element={<Navbar />} />
          <Route path="/tuto" element={<AdminRoute><Tutorials /></AdminRoute>} />
          <Route path="/shelf" element={<AdminRoute><Shelves /></AdminRoute>} />
          <Route path="/aisle" element={<AdminRoute><Aisles /></AdminRoute>} />
          <Route path="/deposit" element={<AdminRoute><Deposits /></AdminRoute>} />
          <Route path="/movement" element={<AdminRoute><Movements /></AdminRoute>} />
          <Route path="/locations" element={<AdminRoute><Locations /></AdminRoute>} />
          <Route path="/audits" element={<AdminRoute><Audits /></AdminRoute>} />
          <Route path="/inf" element={<AdminRoute><Reports /></AdminRoute>} />
          <Route path="/dshb" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/user" element={<PrivateRoute><Users /></PrivateRoute>} />
          <Route path="/category" element={<PrivateRoute><Categories /></PrivateRoute>} />
          <Route path="/enters" element={<PrivateRoute><Materials /></PrivateRoute>} />
          <Route path="/exits" element={<PrivateRoute><Exits /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;