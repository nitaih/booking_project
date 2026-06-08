import React from "react";
import { useNavigate, Link } from "react-router-dom";
// ייבוא האייקונים החדשים מתוך Lucide
import { Hotel, User, LogOut, LogIn } from "lucide-react";

export default function NavBar(){
    const navigate = useNavigate();

    const isLoggedIn = !!localStorage.getItem("token");

    function handleAuthAction(){
        if(isLoggedIn){
            localStorage.removeItem("token");
            alert("see you later");
            navigate("/");
        } else {
            navigate("/login");
        }
    };

    return(
        <header style={styles.navbar} dir="rtl">
            {/* אפקט הובר עדין לכפתור האזור האישי וההתחברות */}
            <style>{`
                .personal-link:hover { background-color: #f3f4f6 !important; color: #1f2937 !important; }
                .btn-auth:hover { opacity: 0.9; transform: translateY(-1px); }
            `}</style>

            {/* צד ימין: שם האפליקציה/לוגו - לחיץ ומחזיר לעמוד הבית */}
            <Link to="/hotels" style={styles.logoContainer}>
                {/* אייקון מלון מודרני מבית Lucide */}
                <Hotel size={24} color="#2563eb" />
                <h1 style={styles.logoText}>HotelBooker</h1>
            </Link>

            {/* צד שמאל: כפתורים דינמיים */}
            <div style={styles.actionsContainer}>
                
                {/* --- כפתור אזור אישי: יוצג רק אם המשתמש מחובר --- */}
                {isLoggedIn && (
                    <Link to="/user-page" className="personal-link" style={styles.personalAreaLink}>
                        {/* אייקון משתמש נקי */}
                        <User size={16} style={{ marginLeft: "8px" }} />
                        האזור האישי שלי
                    </Link>
                )}

                {isLoggedIn ? (
                    <button 
                        onClick={handleAuthAction} 
                        className="btn-auth"
                        style={{ ...styles.authButton, ...styles.personalAreaLink }}
                    >
                        {/* אייקון התנתקות */}
                        <LogOut size={16} style={{ marginLeft: "8px" }} />
                        התנתק (Logout)
                    </button>
                ) : (
                    <button 
                        onClick={handleAuthAction} 
                        className="btn-auth"
                        style={{ ...styles.authButton, ...styles.loginBtn }}
                    >
                        {/* אייקון התחברות */}
                        <LogIn size={16} style={{ marginLeft: "8px" }} />
                        התחבר (Login)
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
    position: 'sticky', 
    top: 0,
    zIndex: 100, 
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none', 
    color: 'inherit',
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
    gap: '12px', // מוסיף מרווח אחיד ויפה בין האזור האישי לכפתור ההתחברות
  },
  authButton: {
    display: 'flex', // מאפשר לאייקון ולטקסט לשבת בשורה אחת ישרה
    alignItems: 'center',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  loginBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
  },
  logoutBtn: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    border: '1px solid #e5e7eb',
  },
  
  // תיקון עיצוב האזור האישי: כעת קריא ובולט על רקע ה-NavBar הלבן
  personalAreaLink: {
        display: 'flex', // מאפשר לאייקון ולטקסט לשבת בשורה אחת ישרה
        alignItems: 'center',
        color: "#4b5563", // צבע אפור כהה שמתאים לכפתור ההתנתקות
        textDecoration: "none",
        fontWeight: "600",
        fontSize: "0.95rem",
        padding: "10px 16px",
        borderRadius: "8px",
        backgroundColor: "#f9fafb", // רקע אפרפר בהיר, נקי מאוד
        border: "1px solid #e5e7eb",
        transition: "all 0.2s ease",
    }
};