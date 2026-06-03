import { useState } from "react";
import {useNavigate, Link, useLocation, useParams} from "react-router-dom";
import { authHeaders } from "./AuthHeaders";

export default function ReserveRoom(){
    const { hotelId, roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const room = location.state?.roomDetails;

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [guestName, setGuestName] = useState(""); // הוספת סטייט לשם האורח עבור המודל
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false); // סטייט לפתיחה/סגירה של המודל

    // הגנה: אם הדף רוענן ופרטי החדר נמחקו מה-state, נציג הודעה ולא ניתן לקוד לקרוס
    if (!room) {
        return (
            <div style={{ textAlign: "center", padding: "40px" }}>
                <p>פרטי החדר לא נמצאו או שהעמוד רוענן.</p>
                <Link to="/hotels" style={{ color: "#2563eb" }}>חזור לרשימת המלונות</Link>
            </div>
        );
    };
    const calculateTotal = () => {
        if (!startDate || !endDate) return { nights: 0, price: 0 };
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const nights = diffDays > 0 ? diffDays : 0;
        return {
            nights: nights,
            price: nights * (room.price || 0)
        };
    };
    const { nights: totalNights, price: totalPrice } = calculateTotal();

    function handleFormSubmit(e) {
        e.preventDefault();
        setError("");

        if (totalNights <= 0) {
            setError("תאריך העזיבה חייב להיות אחרי תאריך ההגעה");
            return;
        }

        setShowModal(true); // מציג את החלון הקופץ
    }

    async function handleFinalConfirm() {
        // e.preventDefault();
        // setError("");

        try{
            const res = await fetch(`http://localhost:3000/api/hotels/${hotelId}/rooms/${roomId}/reservations`, {
                method: "POST",
                headers: authHeaders({"Content-Type": "application/json"}),
                body: JSON.stringify({startDate, endDate})
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
                {/* הודעת שגיאה במידה ויש */}
                {error && <p style={styles.errorText}>⚠️ {error}</p>}
                
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
                <form onSubmit={handleFormSubmit} style={styles.form}>
                    
                    {/* שם מלא */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>שם מלא של האורח</label>
                        <input 
                            type="text" 
                            placeholder="ישראל ישראלי" 
                            required 
                            style={styles.input}
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
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
                        המשך לסיכום ההזמנה
                    </button>
                </form>

            </div>

            {/* ---------------- החלון הקופץ (MODAL) --------------- */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3 style={styles.modalTitle}>📄 סיכום ואישור הזמנה</h3>
                        <p style={styles.modalSub}>אנא בדוק את הפרטים לפני ביצוע ההזמנה:</p>
                        
                        <div style={styles.detailsList}>
                            <div style={styles.detailRow}>
                                <span>🏨 מלון:</span>
                                <strong>{room.hotel?.name}</strong>
                            </div>
                            <div style={styles.detailRow}>
                                <span>🛏️ סוג החדר:</span>
                                <strong>{room.name}</strong>
                            </div>
                            <div style={styles.detailRow}>
                                <span>👤 שם האורח:</span>
                                <strong>{guestName}</strong>
                            </div>
                            <div style={styles.detailRow}>
                                <span>📅 תאריכים:</span>
                                <strong>{startDate} עד {endDate}</strong>
                            </div>
                            <div style={styles.detailRow}>
                                <span>🌙 סה"כ לילות:</span>
                                <strong>{totalNights} לילות</strong>
                            </div>
                            
                            {/* שורת מחיר מודגשת */}
                            <div style={styles.priceRow}>
                                <span>💰 מחיר כולל לתשלום:</span>
                                <strong>{totalPrice} ₪</strong>
                            </div>
                        </div>

                        {/* כפתורי פעולה בחלון הקופץ */}
                        <div style={styles.modalActions}>
                            <button style={styles.confirmButton} onClick={handleFinalConfirm}>
                                ✅ אשר ובצע הזמנה
                            </button>
                            <button style={styles.cancelButton} onClick={() => setShowModal(false)}>
                                חזור לעריכה
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
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
  },
  // הסטייל החדש עבור המודל:
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '450px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
  },
  modalTitle: { margin: '0 0 8px 0', fontSize: '22px', color: '#1f2937', textAlign: 'center' },
  modalSub: { margin: '0 0 24px 0', fontSize: '14px', color: '#6b7280', textAlign: 'center' },
  detailsList: { display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' },
  detailRow: { display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#4b5563' },
  priceRow: { display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #d1d5db', paddingTop: '12px', marginTop: '4px', fontSize: '18px', color: '#1f2937' },
  modalActions: { display: 'flex', flexDirection: 'column', gap: '10px' },
  confirmButton: { backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' },
  cancelButton: { backgroundColor: 'transparent', color: '#4b5563', border: '1px solid #d1d5db', padding: '12px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }
};
