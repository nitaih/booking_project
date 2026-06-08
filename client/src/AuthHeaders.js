import { jwtDecode } from "jwt-decode";

export function authHeaders(extraHeaders = {}){

    const token = localStorage.getItem("token");
    if(!token) {throw new Error("Token is missing")};

    return {
        Authorization: `Bearer ${token}`,
        ...extraHeaders
    }

};

// 2. הפונקציה החדשה לחילוץ ה-ID של המשתמש
export function getUserIdFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        return decoded.user_id; // תואם ל-payload שהגדרת ב-Backend
    } catch (error) {
        console.error("שגיאה בפענוח הטוקן:", error);
        return null;
    }
}