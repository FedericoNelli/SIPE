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
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
