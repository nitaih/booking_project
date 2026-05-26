import { useState } from "react";
import {useNavigate, Link} from "react-router-dom";

export default function Signup(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
   
        try{
            const res = await fetch("http://localhost:3000/api/users/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password})
            });
            const data = await res.json();

            if(!res.ok) {
                setError(data.error || "signup error");
                return;
            } 
            navigate("/login")
        } catch(err) {
                console.error(err);
                setError("network error");
        }
    }

    return (
        <div>
            <h2>Signup Here</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                />
                <input type="password"
                value={password}
                onChange={e => setPassword(e.target.value)} 
                />
                <button type="submit">Signup</button>
            </form>
            {error && <p style={{color: "red"}}>{error}</p>}

            <p>
                already registered? <Link to="/login">login here</Link>
            </p>
        </div>
    )
};