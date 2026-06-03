import React from "react";
import { useNavigate, Link } from "react-router-dom";

export default function NavBar(){
    const navigate = useNavigate();

    const isLoggedIn = !!localStorage.getItem("token");

    function handleAuthAction(){
        if(isLoggedIn){
            localStorage.removeItem("token");

            alert("see you later");
            navigate("/");
        } else {
            navigate("/login")
        }
    };

    return(
        <header style={styles.navbar} dir="rtl">
            {/* צד ימין: שם האפליקציה/לוגו - לחיץ ומחזיר לעמוד הבית */}
            <Link to="/hotels" style={styles.logoContainer}>
                <span style={styles.logoIcon}>🏨</span>
                <h1 style={styles.logoText}>HotelBooker</h1>
            </Link>

            {/* צד שמאל: כפתור התחברות / התנתקות דינמי */}
            <div style={styles.actionsContainer}>
                {isLoggedIn ? (
                    <button 
                        onClick={handleAuthAction} 
                        style={{ ...styles.authButton, ...styles.logoutBtn }}
                    >
                        🚪 התנתק (Logout)
                    </button>
                ) : (
                    <button 
                        onClick={handleAuthAction} 
                        style={{ ...styles.authButton, ...styles.loginBtn }}
                    >
                        🔑 התחבר (Login)
                    </button>
                )}
            </div>
        </header>
    );
};

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 40px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    borderBottom: '1px solid #f3f4f6',
    position: 'sticky', // גורם לבאנר להישאר קבוע למעלה בזמן גלילה
    top: 0,
    zIndex: 100, // מבטיח שהוא יהיה מעל כרטיסיות המלונות והחדרים
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none', // מבטל קו תחתון של קישור
    color: 'inherit',
  },
  logoIcon: {
    fontSize: '24px',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1f2937',
    margin: 0,
    fontFamily: 'sans-serif',
    letterSpacing: '-0.5px',
  },
  actionsContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  authButton: {
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  // עיצוב ספציפי לכפתור התחברות (כחול כמו שאר האתר)
  loginBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
    onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#1d4ed8', // אפשר להוסיף inline hover בקומפוננטה
  },
  // עיצוב ספציפי לכפתור התנתקות (אפור-עדין או אדום עדין שלא יבלוט מדי)
  logoutBtn: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    border: '1px solid #e5e7eb',
  }
};