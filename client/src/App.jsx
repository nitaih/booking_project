import { BrowserRouter, Routes, Route, Link, Navigate, Outlet } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Hotels from "./Hotels";
import RoomsPage from "./RoomsPage";
import Room from "./Room";
import ReserveRoom from "./ReserveRoom";
import NavBar from "./NavBar";

function Home(){
  return (
          <div style={styles.heroContainer}>
              {/* כותרת / Header */}
              <header style={styles.header}>
                  <div style={styles.logo}>BookingApp</div>
                  <nav>
                      <Link to="/login" style={styles.navLink}>התחברות</Link>
                  </nav>
              </header>

              {/* התוכן המרכזי של דף הבית */}
              <main style={styles.mainContent}>
                  <h1 style={styles.title}>החופשה הבאה שלך מתחילה כאן</h1>
                  <p style={styles.subtitle}>גלה את המלונות המובילים במחירים הטובים ביותר</p>
                  
                  <div style={styles.buttonContainer}>
                      <Link to="/register" style={styles.primaryButton}>הירשם עכשיו</Link>
                      <Link to="/hotels" style={styles.secondaryButton}>צפייה במלונות</Link>
                  </div>
              </main>
          </div>
      );  

}

function ProtectedRoute() { // לא צריך children יותר!
    const token = localStorage.getItem("token");
    
    // Outlet מייצג את "תתי הנתיבים" שירונדרו כאן
    return token ? (
      <>
        <NavBar />
        <main>
          <Outlet /> 
        </main>
      </>
    ) : (
      <Navigate to="/login" />
    );
}

function AppRoutes() {
    return (
        <Routes>
            {/* --- ראוטים ציבוריים (ללא NavBar, פתוחים לכולם) --- */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Signup />} />

            {/* --- ראוטים מוגנים (כוללים NavBar, דורשים טוקן) --- */}
            <Route element={<ProtectedRoute />}>
                <Route path="/hotels" element={<Hotels />} />
                <Route path="/hotels/:hotelId/rooms" element={<RoomsPage />} />
                <Route path="/hotels/:hotelId/rooms/:roomId" element={<Room />} />
                <Route path="/hotels/:hotelId/rooms/:roomId/reservations" element={<ReserveRoom />} />
            </Route>
        </Routes>
    );
};
export default function App() {
    return (
            <AppRoutes />
    );
}

const styles = {
    // עיצוב למסך ה-Hero הראשי של עמוד הבית (תופס מסך מלא עם תמונת השקיעה)
    heroContainer: {
        height: "100vh",
        width: "100vw",
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
        color: "#ffffff",
        overflow: "hidden"
    },
    // ההדר הפנימי והשקוף הייחודי של עמוד הבית בלבד
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 40px",
        background: "rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(5px)"
    },
    logo: {
        fontSize: "24px",
        fontWeight: "bold",
        letterSpacing: "1px"
    },
    navLink: {
        color: "#ffffff",
        textDecoration: "none",
        fontSize: "16px",
        fontWeight: "500"
    },
    // התוכן המרכזי שיושב באמצע ה-Hero של עמוד הבית
    mainContent: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "0 20px"
    },
    title: {
        fontSize: "48px",
        marginBottom: "15px",
        textShadow: "2px 2px 4px rgba(0,0,0,0.6)"
    },
    subtitle: {
        fontSize: "20px",
        marginBottom: "30px",
        textShadow: "1px 1px 3px rgba(0,0,0,0.5)"
    },
    buttonContainer: {
        display: "flex",
        gap: "20px"
    },
    // כפתור ראשי מעודכן לכחול האחיד של האפליקציה כולה
    primaryButton: {
        padding: "12px 30px",
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#2563eb", // הותאם ל-Blue-600 של שאר האתר לאחידות מושלמת
        textDecoration: "none",
        borderRadius: "25px",
        fontWeight: "bold",
        transition: "background 0.3s",
        boxShadow: "0 4px 6px rgba(0,0,0,0.2)"
    },
    secondaryButton: {
        padding: "12px 30px",
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        textDecoration: "none",
        borderRadius: "25px",
        fontWeight: "bold",
        border: "2px solid #ffffff",
        transition: "all 0.3s",
        backdropFilter: "blur(5px)"
    }
};