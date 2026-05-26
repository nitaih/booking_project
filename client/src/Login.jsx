import { useState } from "react";
import {useNavigate, Link} from "react-router-dom";

export default function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    // const [error, setError] = useState("");

    const navigate = useNavigate();

    async function handleSubmit(e){
        e.preventDefault();
        try{
            const res = await fetch("http://localhost:3000/api/users/login",{
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password})
            });
            const data = await res.json();

            if(!res.ok){
                setMessage(data.error || "connection error");
                return;
            }
            localStorage.setItem("token", data.token);
            navigate("/hotels");
        }catch(err){
            console.error(err);
            setMessage("Network Error")
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input type="email"
                value={email}
                placeholder="email adress"
                onChange={e => setEmail(e.target.value)} 
                />
                <input type="password" 
                value={password}
                placeholder="Enter Password"
                onChange={e => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>

            <p>not registered yet? <Link to="/register">signup here</Link></p>



        </div>
    )
}