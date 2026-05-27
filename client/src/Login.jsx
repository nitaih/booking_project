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
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                <h2 style={styles.heading}>Login</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input type="email"
                    value={email}
                    placeholder="email adress"
                    onChange={e => setEmail(e.target.value)} 
                    style={styles.input}
                    required
                    />
                    <input type="password" 
                    value={password}
                    placeholder="Enter Password"
                    onChange={e => setPassword(e.target.value)}
                    style={styles.input}
                    required
                    />
                    <button type="submit" style={styles.button}>Login</button>
                </form>
                {message && <p style={styles.errorMessage}>{message}</p>}

                <p>not registered yet? <Link to="/register" style={styles.link}>signup here</Link></p>
            </div>
        </div>
    )
};

// אובייקט העיצוב המשותף (יופיע גם בקובץ השני)
const styles = {
    pageContainer: {
        height: "100vh",
        width: "100vw",
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        direction: "rtl" // התאמה לעברית
    },
    card: {
        background: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        padding: "40px",
        borderRadius: "16px",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        width: "100%",
        maxWidth: "400px",
        textAlign: "center",
        color: "#ffffff"
    },
    heading: {
        fontSize: "28px",
        marginBottom: "25px",
        fontWeight: "bold",
        letterSpacing: "0.5px"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "16px"
    },
    input: {
        padding: "14px 16px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        background: "rgba(255, 255, 255, 0.9)",
        color: "#333333",
        outline: "none",
        transition: "border-color 0.3s"
    },
    button: {
        padding: "14px",
        fontSize: "16px",
        fontWeight: "bold",
        color: "#ffffff",
        backgroundColor: "#007bff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        boxShadow: "0 4px 15px rgba(0, 123, 255, 0.3)",
        transition: "background-color 0.3s, transform 0.1s"
    },
    errorMessage: {
        color: "#ff6b6b",
        backgroundColor: "rgba(255, 107, 107, 0.15)",
        padding: "10px",
        borderRadius: "6px",
        fontSize: "14px",
        marginTop: "15px",
        border: "1px solid rgba(255, 107, 107, 0.3)"
    },
    footerText: {
        marginTop: "25px",
        fontSize: "14px",
        color: "rgba(255, 255, 255, 0.8)"
    },
    link: {
        color: "#339af0",
        textDecoration: "none",
        fontWeight: "bold"
    }
};