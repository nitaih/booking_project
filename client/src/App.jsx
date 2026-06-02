import { Routes, Route, Link, Navigate } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Hotels from "./Hotels";
import RoomsPage from "./RoomsPage";
import Room from "./Room";
import ReserveRoom from "./ReserveRoom";

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

function ProtectedRoute({children}) {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Signup />} />

            <Route path="/hotels" element={
              <ProtectedRoute>
                <Hotels />
              </ProtectedRoute>
              } />
            <Route path="/hotels/:hotelId/rooms" element={
              <ProtectedRoute>
                <RoomsPage />
              </ProtectedRoute>
              } />
            <Route path="/hotels/:hotelId/rooms/:roomId" element={
              <ProtectedRoute>
                <Room />
              </ProtectedRoute>
              } />
            <Route path="/hotels/:hotelId/rooms/:roomId/reservations" element={
                <ProtectedRoute>
                <ReserveRoom />
              </ProtectedRoute>
              } />
        </Routes>
    );
};

const styles = {
    heroContainer: {
        height: "100vh",
        width: "100vw",
        // שימוש בתמונת רקע איכותית של ים ושקיעה מבית Unsplash
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
        color: "#ffffff",
        overflow: "hidden"
    },
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
    primaryButton: {
        padding: "12px 30px",
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#007bff",
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

export default App
