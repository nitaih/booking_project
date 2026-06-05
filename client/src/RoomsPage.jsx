import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // <-- מייבאים את useParams
import { authHeaders } from "./AuthHeaders";
import { Routes, Route, Link, Navigate } from "react-router-dom";

export default function RoomsPage(){
    const {hotelId} = useParams();

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_base = "http://localhost:8000/api";

    useEffect(() => {
        async function loadRooms() {
            try {
                const res = await fetch(`${API_base}/hotels/${hotelId}/rooms`,{
                    method: "GET",
                    headers: authHeaders()
                });
                const data = await res.json();
                setRooms(data); 
            } catch (error) {
                console.error("Error loading rooms:", error);
            } finally {
                setLoading(false)
            }
            
        };
        loadRooms();

    }, [hotelId]);
    const hotelName = rooms[0]?.hotel?.name;

    return (
        <div>
            <h1>{hotelName}</h1>       
            <ul style={styles.gridList}>
                {
                    rooms.map(r => (
                        <li key={r.id} style={{ listStyleType: 'none' }}>
                            <Link to={`/hotels/${hotelId}/rooms/${r.id}`} style={styles.cardLink}>
                                <div style={styles.imageWrapper}>
                                    <img 
                                    src={r.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80'} 
                                    alt={r.name}
                                    style={styles.image}
                                    loading="lazy"
                                    />
                                    {/* דירוג כוכבים צף */}
                                    <div style={styles.badge}>
                                    {r.price }₪ ללילה
                                    </div>
                                </div>

                                {/* תוכן הכרטיסייה */}
                                <div style={styles.content} dir="rtl">
                                    <h3 style={styles.title}>{r.name}</h3>
                                    <p style={styles.location}>Guest Capacity {r.max_guests} | Size: {r.size}</p>

                                    {/* חלק תחתון - חדרים וכפתור */}
                                    <div style={styles.footer}>
                                    {/* <span style={styles.rooms}>Size: {r.size}</span> */}
                                    <button 
                                        style={styles.button}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                                    >
                                        הזמן עכשיו
                                    </button>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))
                }
            </ul>
        </div>
    )
};

const styles = {
  gridList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    padding: '24px',
    listStyleType: 'none',
    margin: 0,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #f3f4f6',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
  },
  imageWrapper: {
    position: 'relative',
    height: '192px',
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#ffffff',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    backdropFilter: 'blur(4px)',
  },
  content: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    textAlign: 'right',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 4px 0',
  },
  location: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 16px 0',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: '12px',
    borderTop: '1px solid #f3f4f6',
    display: 'flex',
    justifyContent: 'between',
    alignItems: 'center',
    gap: '10px'
  },
  rooms: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  button: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    padding: '6px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  }
};