import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Hotels from "./Hotels";

function HomeRedirect() {
    const token = localStorage.getItem("token");
    return <Navigate to={token ? "/hotels" : "/login"} />;
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/hotels" element={<Hotels />} />
        </Routes>
    );
}

export default App
