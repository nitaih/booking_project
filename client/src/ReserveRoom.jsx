import { useState } from "react";
import {useNavigate, Link, useLocation, useParams} from "react-router-dom";
import { authHeaders } from "./AuthHeaders";

export default function ReserveRoom(){
    const { hotelId, roomId } = useParams();
    const location = useLocation();

    const room = location.state?.roomDetails;
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        try{
            const res = await fetch(`http://localhost:3000/api/hotels/${hotelId}/rooms/${roomId}/reservations?startDate=${startDate}&endDate=${endDate}`, {
                method: "POST",
                headers: authHeaders()
            });
            const data = await res.json();

            if(!res.ok) {
                setError(data.error || "reservation error");
                return;
            } 
            navigate(`/hotels/${hotelId}/rooms/${roomId}`)
        } catch(err) {
                console.error(err);
                setError("network error");
        }
    }

    return(
        <div style={styles.container} dir="rtl">
            <div style={styles.formWrapper}>
                
                {/* כותרת הטופס */}
                <h2 style={styles.formTitle}>הזמנת חדר במלון</h2>
                
                {/* אזור 1: תקציר פרטי החדר הנבחר */}
                <div style={styles.roomSummary}>
                    <p style={styles.summaryText}>
                        🏨 <strong>מלון:</strong> {room.hotel?.name || "שם המלון"}
                    </p>
                    <p style={styles.summaryText}>
                        🛏️ <strong>סוג החדר:</strong> {room.name || "חדר סטנדרטי"}
                    </p>
                    <p style={styles.summaryText}>
                        💰 <strong>מחיר ללילה:</strong> {room.price}₪
                    </p>
                </div>

                {/* אזור 2: הטופס עצמו */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    
                    {/* שם מלא */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>שם מלא של האורח</label>
                        <input 
                            type="text" 
                            placeholder="ישראל ישראלי" 
                            required 
                            style={styles.input}
                        />
                    </div>

                    {/* אימייל */}
                    {/* <div style={styles.inputGroup}>
                        <label style={styles.label}>כתובת אימייל לקבלת אישור</label>
                        <input 
                            type="email" 
                            placeholder="your@email.com" 
                            required 
                            style={styles.input}
                        />
                    </div> */}

                    {/* אזור התאריכים (מסודרים אחד לצד השני בגריד) */}
                    <div style={styles.dateGrid}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>תאריך הגעה (Check-in)</label>
                            <input 
                                type="date" 
                                required 
                                style={styles.input}
                                onChange={(e) => {setStartDate(e.target.value)}}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>תאריך עזיבה (Check-out)</label>
                            <input 
                                type="date" 
                                required 
                                style={styles.input}
                                onChange={(e) => {setEndDate(e.target.value)}}
                            />
                        </div>
                    </div>

                    {/* כפתור אישור הזמנה */}
                    <button 
                        type="submit" 
                        style={styles.submitButton}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                    >
                        ⚡ אשר והזמן עכשיו
                    </button>
                </form>

            </div>
        </div>
    )
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
    backgroundColor: '#f9fafb', // רקע אפור בהיר ונעים לכל העמוד
    minHeight: '80vh',
  },
  formWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: '16px', // פינות מעוגלות מעט יותר עבור טפסים ומכלים גדולים
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '550px', // רוחב מקסימלי אידיאלי לקריאה ומילוי בטפסים
    padding: '32px',
    border: '1px solid #f3f4f6',
  },
  formTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    margin: '0 0 24px 0',
  },
  roomSummary: {
    backgroundColor: '#eff6ff', // רקע כחלחל מעודן שמבליט את פרטי ההזמנה
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '28px',
    border: '1px solid #bfdbfe',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  summaryText: {
    fontSize: '15px',
    color: '#1e40af', // טקסט כחול כהה שמתאים לרקע
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px', // מרווח קבוע ונקי בין השדות
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4b5563',
    textAlign: 'right',
  },
  input: {
    padding: '12px 16px',
    fontSize: '15px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    textAlign: 'right', // תומך בכתיבה ויישור מימין לשמאל
    fontFamily: 'inherit',
  },
  dateGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', // מחלק את התאריכים לשני טורים שווים
    gap: '16px',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    padding: '14px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginTop: '10px',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
  }
};