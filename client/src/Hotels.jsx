import { useState, useEffect } from "react";
import React from 'react';
import { authHeaders } from "./AuthHeaders";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import RoomsPage from "./RoomsPage";

export default function Hotels(){
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_base = "http://localhost:8000/api";
    useEffect(() => {
        async function loadHotels() {
            try {
                const res = await fetch(`${API_base}/hotels`,{
                    method: "GET",
                    headers: authHeaders()
                });
                const data = await res.json();
                setHotels(data);
            } catch (error) {
                console.error("Error loading hotels:", error);
                
            } finally{
                setLoading(false);
            }
        }
        loadHotels();
    }, []);
    if(loading) return <p>Loading hotels...</p>;

    return (
        <div>
            {/* <h1>Our Hotels:</h1> */}
            <ul style={styles.gridList}>
                {
                    hotels.map(h => (
                        <li key={h.id} style={{ listStyleType: 'none' }}>
                            <Link to={`/hotels/${h.id}/rooms`} style={styles.cardLink}>
                                <div style={styles.imageWrapper}>
                                    <img 
                                    src={h.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80'} 
                                    alt={h.name}
                                    style={styles.image}
                                    loading="lazy"
                                    />
                                    {/* דירוג כוכבים צף */}
                                    <div style={styles.badge}>
                                    ⭐ {h.stars} כוכבים
                                    </div>
                                </div>

                                {/* תוכן הכרטיסייה */}
                                <div style={styles.content} dir="rtl">
                                    <h3 style={styles.title}>{h.name}</h3>
                                    <p style={styles.location}>📍 {h.city}, {h.country}</p>

                                    {/* חלק תחתון - חדרים וכפתור */}
                                    <div style={styles.footer}>
                                    <span style={styles.rooms}>חדרים: {h.number_of_rooms}</span>
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