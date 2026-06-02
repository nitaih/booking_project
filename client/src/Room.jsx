import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // <-- מייבאים את useParams
import { authHeaders } from "./AuthHeaders";
import { Routes, Route, Link, Navigate } from "react-router-dom";

export default function Room(){
    const {hotelId, roomId} = useParams();
    
        const [room, setRoom] = useState([]);
        const [loading, setLoading] = useState(true);
        const API_base = "http://localhost:3000/api";
    
        useEffect(() => {
            async function loadRooms() {
                try {
                    const res = await fetch(`${API_base}/hotels/${hotelId}/rooms/${roomId}`,{
                        method: "GET",
                        headers: authHeaders()
                    });
                    const data = await res.json();
                    setRoom(data); 
                } catch (error) {
                    console.error("Error loading rooms:", error);
                } finally {
                    setLoading(false)
                }
                
            };
            loadRooms();
    
        }, [roomId]);

        return(
            <li style={styles.card}>
                {/* אזור התמונה והמחיר הצף */}
                <div style={styles.imageWrapper}>
                    <img 
                        src={room.image_url || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&q=80'} 
                        alt={room.name || 'Hotel Room'}
                        style={styles.image}
                        loading="lazy"
                    />
                    {/* תגית מחיר צפה */}
                    <div style={styles.badge}>
                        {room.price}₪ <span style={styles.perNight}>/ ללילה</span>
                    </div>
                </div>

                {/* תוכן הכרטיסייה (טקסט ופרטים) */}
                <div style={styles.content} dir="rtl">
                    {/* שם המלון - תוספת חדשה, עיצוב נקי ומשני */}
                    {room.hotel?.name && (
                    <span style={styles.hotelName}>
                     {room.hotel.name}
                    </span>
                )}
                    <h3 style={styles.title}>{room.name || 'חדר סטנדרטי'}</h3>
                    
                    {/* מפרט החדר (אייקונים וטקסט) */}
                    <div style={styles.detailsContainer}>
                        <p style={styles.detailItem}>
                            👥 <strong>תפוסה מקסימלית:</strong> {room.max_guests} אורחים
                        </p>
                        
                    </div>

                    {/* חלק תחתון - גודל חדר וכפתור הזמנה */}
                    <div style={styles.footer}>
                        <span style={styles.sizeText}>
                            📐 גודל: {room.size} מ"ר
                        </span>
                        <button 
                            style={styles.button}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        >
                            <Link to={`/hotels/${hotelId}/rooms/${roomId}/reservations`} state={{ roomDetails: room }}>
                            הזמן חדר זה
                            </Link>
                            
                        </button>
                    </div>
                </div>
        </li>
    );

        
    
};

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #f3f4f6',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    height: '100%', // מבטיח שכל הכרטיסיות יהיו באותו הגובה בגריד
  },
  imageWrapper: {
    position: 'relative',
    height: '200px',
    width: '100%',
    backgroundColor: '#e5e7eb',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  badge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    color: '#ffffff',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    backdropFilter: 'blur(4px)',
  },
  perNight: {
    fontSize: '11px',
    fontWeight: 'normal',
    color: '#d1d5db',
  },
  content: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1, // דוחף את הפוטר לתחתית הכרטיסייה
    textAlign: 'right',
  },
  hotelName: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#4b5563',       // צבע אפור כהה מעודן (Muted text)
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',    // מרווח קטן וקבוע מהכותרת שמתחתיו
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 12px 0',
  },
  detailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px',
  },
  detailItem: {
    fontSize: '14px',
    color: '#4b5563',
    margin: 0,
  },
  footer: {
    marginTop: 'auto', // קריטי: שומר על כפתורים מיושרים פלס בתחתית
    paddingTop: '14px',
    borderTop: '1px solid #f3f4f6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sizeText: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  button: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    padding: '8px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  }
};
