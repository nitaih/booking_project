import { useState, useEffect } from "react";
import { authHeaders, getUserIdFromToken } from "./AuthHeaders";

export default function UserPage() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // סטייט לניהול עריכה
    const [editingResId, setEditingResId] = useState(null);
    const [editStartDate, setEditStartDate] = useState("");
    const [editEndDate, setEditEndDate] = useState("");

    const API_base = "http://localhost:8000/api";

    useEffect(() => {
        async function loadReservations() {
            try {
                const userId = getUserIdFromToken();
                if (!userId) {
                    setError("משתמש לא מחובר או אסימון פג תוקף");
                    return;
                }
                const res = await fetch(`${API_base}/users/${userId}/reservations`, {
                    method: "GET",
                    headers: authHeaders()
                });
                const data = await res.json();
                
                if (!res.ok) throw new Error(data.error || "נכשל בטעינת ההזמנות");
                
                setReservations(data);
            } catch (error) {
                console.error("Error loading Reservations:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }
        loadReservations();
    }, []);

    const handleCancelReservation = async (resId) => {
        if (!window.confirm("האם אתה בטוח שברצונך לבטל הזמנה זו?")) return;

        try {
            setError("");
            setSuccessMessage("");
            const userId = getUserIdFromToken();
            
            const res = await fetch(`${API_base}/users/${userId}/reservations/${resId}`, {
                method: "DELETE",
                headers: authHeaders()
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "ביטול ההזמנה נכשל");

            setReservations(prev => prev.filter(item => item.id !== resId));
            setSuccessMessage("ההזמנה בוטלה בהצלחה.");
        } catch (error) {
            setError(error.message);
        }
    };

    const startEditing = (res) => {
        setEditingResId(res.id);
        setEditStartDate(new Date(res.start_date).toISOString().split('T')[0]);
        setEditEndDate(new Date(res.end_date).toISOString().split('T')[0]);
    };

    const handleSaveEdit = async (resId) => {
        try {
            setError("");
            setSuccessMessage("");
            const userId = getUserIdFromToken();

            const res = await fetch(`${API_base}/users/${userId}/reservations/${resId}`, {
                method: "PATCH",
                headers: authHeaders({ "Content-Type": "application/json" }),
                body: JSON.stringify({
                    start_date: editStartDate,
                    end_date: editEndDate
                })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "עדכון ההזמנה נכשל");

            setReservations(prev => prev.map(item => item.id === resId ? data.reservation : item));
            setEditingResId(null);
            setSuccessMessage("ההזמנה עודכנה בהצלחה!");
        } catch (error) {
            setError(error.message);
        }
    };

    if (loading) return <div style={styles.centerContainer}><p style={styles.loadingText}>טוען הזמנות...</p></div>;

    return (
        <div style={styles.pageContainer} dir="rtl">
            <style>{`
                .btn-edit:hover { background-color: #3182ce !important; transform: translateY(-1px); }
                .btn-delete:hover { background-color: #e53e3e !important; transform: translateY(-1px); }
                .btn-cancel:hover { background-color: #718096 !important; }
                .reservation-row:hover { transform: translateX(-4px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); border-right-color: #3182ce !important; }
            `}</style>

            <h1 style={styles.title}>האזור האישי שלי</h1>
            <p style={styles.subtitle}>כאן תוכל לצפות, לערוך ולבטל את ההזמנות הפעילות שלך.</p>

            {error && <div style={styles.errorBanner}>{error}</div>}
            {successMessage && <div style={styles.successBanner}>{successMessage}</div>}

            {reservations.length === 0 ? (
                <div style={styles.noReservations}>
                    <p>לא נמצאו הזמנות פעילות במערכת.</p>
                </div>
            ) : (
                <div style={styles.listContainer}>
                    {reservations.map((res) => (
                        <div key={res.id} className="reservation-row" style={styles.rowCard}>
                            
                            {editingResId === res.id ? (
                                /* --- מצב עריכה (נפתח לרוחב השורה) --- */
                                <div style={styles.editFormHorizontal}>
                                    <div style={styles.editInfoGroup}>
                                        <span style={styles.resIdTag}>עריכת הזמנה #{res.id}</span>
                                        <div style={styles.inputsRow}>
                                            <div style={styles.inputGroup}>
                                                <label style={styles.label}>תאריך כניסה:</label>
                                                <input 
                                                    type="date" 
                                                    value={editStartDate} 
                                                    onChange={(e) => setEditStartDate(e.target.value)}
                                                    style={styles.input}
                                                />
                                            </div>
                                            <div style={styles.inputGroup}>
                                                <label style={styles.label}>תאריך יציאה:</label>
                                                <input 
                                                    type="date" 
                                                    value={editEndDate} 
                                                    onChange={(e) => setEditEndDate(e.target.value)}
                                                    style={styles.input}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div style={styles.actions}>
                                        <button onClick={() => handleSaveEdit(res.id)} className="btn-edit" style={{...styles.button, backgroundColor: "#4299e1"}}>שמור</button>
                                        <button onClick={() => setEditingResId(null)} className="btn-cancel" style={{...styles.button, backgroundColor: "#a0aec0"}}>ביטול</button>
                                    </div>
                                </div>
                            ) : (
                                /* --- מצב תצוגה רגיל - שורה אופקית מלאה --- */
                                <>
                                    {/* חלק ימני: מזהה וסטטוס */}
                                    <div style={styles.metaSection}>
                                        <span style={styles.resIdTag}>הזמנה #{res.id}</span>
                                        <span style={styles.statusTag}>{res.status}</span>
                                    </div>

                                    {/* חלק מרכזי: פרטי השהות מסודרים בשורה */}
                                    <div style={styles.detailsSection}>
                                        {res.hotel && (
                                            <div style={styles.infoBlock}>
                                                <span style={styles.blockLabel}>מלון</span>
                                                <span style={{...styles.blockValue, color: "#1a202c", fontWeight: "bold"}}>{res.hotel.name}</span>
                                            </div>
                                        )}
                                        <div style={styles.infoBlock}>
                                            <span style={styles.blockLabel}>חדר</span>
                                            <span style={styles.blockValue}>{res.room_id}</span>
                                        </div>
                                        <div style={styles.infoBlock}>
                                            <span style={styles.blockLabel}>תאריך כניסה</span>
                                            <span style={styles.blockValue}>{new Date(res.start_date).toLocaleDateString('he-IL')}</span>
                                        </div>
                                        <div style={styles.infoBlock}>
                                            <span style={styles.blockLabel}>תאריך יציאה</span>
                                            <span style={styles.blockValue}>{new Date(res.end_date).toLocaleDateString('he-IL')}</span>
                                        </div>
                                        {res.total_price && (
                                            <div style={styles.infoBlock}>
                                                <span style={styles.blockLabel}>מחיר כולל</span>
                                                <span style={{...styles.blockValue, color: "#2b6cb0", fontWeight: "bold"}}>₪{res.total_price}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* חלק שמאלי: כפתורי פעולה */}
                                    <div style={styles.actionsSection}>
                                        <button onClick={() => startEditing(res)} className="btn-edit" style={{...styles.button, backgroundColor: "#3182ce"}}>עריכה</button>
                                        <button onClick={() => handleCancelReservation(res.id)} className="btn-delete" style={{...styles.button, backgroundColor: "#e53e3e"}}>ביטול</button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// אובייקט העיצוב החדש - רשימת שורות לרוחב העמוד
const styles = {
    pageContainer: {
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#2d3748",
    },
    centerContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "50vh"
    },
    loadingText: {
        fontSize: "1.2rem",
        color: "#4a5568"
    },
    title: {
        fontSize: "2.2rem",
        fontWeight: "bold",
        marginBottom: "10px",
        color: "#1a202c"
    },
    subtitle: {
        fontSize: "1.05rem",
        color: "#718096",
        marginBottom: "30px"
    },
    errorBanner: {
        backgroundColor: "#fff5f5",
        borderRight: "4px solid #e53e3e",
        color: "#c53030",
        padding: "15px",
        borderRadius: "4px",
        marginBottom: "20px"
    },
    successBanner: {
        backgroundColor: "#f0fff4",
        borderRight: "4px solid #38a169",
        color: "#276749",
        padding: "15px",
        borderRadius: "4px",
        marginBottom: "20px"
    },
    noReservations: {
        textAlign: "center",
        padding: "50px",
        backgroundColor: "#f7fafc",
        borderRadius: "8px",
        border: "1px dashed #e2e8f0"
    },
    listContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "16px", // מרווח בין השורות
    },
    rowCard: {
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        borderRight: "4px solid #cbd5e0", // פס צדדי אפור שמשתנה לכחול ב-Hover
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        transition: "all 0.2s ease-in-out",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
        flexWrap: "wrap" // שומר על רספונסיביות במסכים קטנים
    },
    metaSection: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        minWidth: "100px"
    },
    resIdTag: {
        fontWeight: "bold",
        color: "#1a202c",
        fontSize: "1.1rem"
    },
    statusTag: {
        alignSelf: "start",
        backgroundColor: "#ebf8ff",
        color: "#2b6cb0",
        padding: "2px 8px",
        borderRadius: "12px",
        fontSize: "0.8rem",
        fontWeight: "600"
    },
    detailsSection: {
        display: "flex",
        flex: 1,
        justifyContent: "space-around",
        gap: "20px",
        minWidth: "300px"
    },
    infoBlock: {
        display: "flex",
        flexDirection: "column",
        gap: "4px"
    },
    blockLabel: {
        fontSize: "0.8rem",
        color: "#718096",
        fontWeight: "500"
    },
    blockValue: {
        fontSize: "1rem",
        color: "#2d3748",
        fontWeight: "500"
    },
    actionsSection: {
        display: "flex",
        gap: "10px",
        justifyContent: "flex-end",
        minWidth: "160px"
    },
    button: {
        padding: "8px 16px",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "0.9rem",
        transition: "all 0.15s ease",
    },
    /* עיצוב אופקי לטופס העריכה */
    editFormHorizontal: {
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        flexWrap: "wrap"
    },
    editInfoGroup: {
        display: "flex",
        alignItems: "center",
        gap: "24px",
        flex: 1,
        flexWrap: "wrap"
    },
    inputsRow: {
        display: "flex",
        gap: "16px"
    },
    inputGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "4px"
    },
    label: {
        fontSize: "0.8rem",
        color: "#718096"
    },
    input: {
        padding: "6px 10px",
        borderRadius: "6px",
        border: "1px solid #cbd5e0",
        fontSize: "0.9rem",
        outline: "none",
        fontFamily: "inherit"
    },
    actions: {
        display: "flex",
        gap: "10px"
    }
};