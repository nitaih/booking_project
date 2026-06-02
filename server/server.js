import express from "express";
import cors from "cors";
import prisma from "./db_prisma.js";
import {hashPassword, validatePassword, createToken, auth, requiredRole} from "./auth.js";

const app = express();

app.use(cors({origin:"http://localhost:5174"}));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({message: "Welcome"})
});

// User registration
app.post("/api/users/register", async (req, res, next) => {
    const {email, password, role} = req.body;

    try{
        // check if user exist
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if(user) return res.status(400).json({message: "user is already exist"});

        // hash password
        const hashedPassword = await hashPassword(password);

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role
            }
        });
        res.status(201).json({
            message: "user registered successfully",
            user:{
                id: newUser.id,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch(err){
        next(err);
    }
});

// login
app.post("/api/users/login", async (req, res, next) => {
    try{
        const {email, password} = req.body;
        const user = await prisma.user.findUnique({
            where: {email: email}
        });
        if(!user) return res.status(400).json("Email or password are wrong");
        // hash password
        const hashedPassword = await hashPassword(password);
        const isPasswordValid = await validatePassword(password, user.password);
        if(!isPasswordValid) return res.status(401).json("Email or password are wrong");

        const token = createToken(user);

        return res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });


    } catch(err) {
        next(err);
    }
});

// get all hotels
app.get("/api/hotels", auth, async (req, res, next) => {
    try{
        const hotels = await prisma.hotel.findMany();
        if(!hotels) res.status(404).json("No hotels are found");
        res.status(201).json(hotels);
    } catch(err){
        next(err);
    }
});

// get all rooms by hotel id
app.get("/api/hotels/:hotelId/rooms", auth, async (req, res, next) => {
    try{
        const hotel_id = Number(req.params.hotelId);

        const rooms = await prisma.room.findMany({
            where: {hotel_id: hotel_id},
            include: {
                hotel: {
                    select: {
                        name: true
                    } // <-- סגירת ה-select
                } // <-- סגירת ה-hotel
            }
        });
        if(rooms.length === 0) return res.status(404).json("No rooms");

        res.status(201).json(rooms)
    } catch(err) {
        next(err);
    }
});

// get room by ID
app.get("/api/hotels/:hotelId/rooms/:id", auth, async (req, res, next) => {
    try{
        const room_id = Number(req.params.id);
        const hotel_id = Number(req.params.hotelId);

        const room = await prisma.room.findFirst({
            where: {
                    hotel_id: hotel_id,
                    id: room_id
            },
                include: {
                    hotel: {
                        select: {
                            name: true // מביא רק את עמודת השם מטבלת המלונות
                }
            }
        }
        });
        if(!room) return res.status(404).json("Room not found");
        res.status(200).json(room);
    } catch(err) {
        next(err);
    }
})

// get available rooms
app.get("/api/available_rooms", auth, async (req, res, next) => {
    try{
        const {startDate, endDate} = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "startDate and endDate are required" });
        };
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
            return res.status(422).json({ message: "Dates range is not valid" });
        };

        const availableRooms = await prisma.room.findMany({
            where: {
                reservations:{
                    none: {
                        AND: [
                            {start_date: {lt: end}},
                            {end_date: {gt: start}}
                        ]
                    }    
                }    
            },
            include: {
                hotel: true
            }
        });
        if(availableRooms.length === 0) return res.status(200).json("no available rooms in that date");

        res.status(200).json(availableRooms);
    } catch(err){
        next(err);
    }
});

// create reservation
app.post("/api/hotels/:hotel_id/rooms/:room_id/reservations", auth, async (req, res, next) => {
    try{
        const user_id = req.user_id;
        const {startDate, endDate} = req.query;
        const hotel_id = Number(req.params.hotel_id);
        const room_id = Number(req.params.room_id);
            if (!startDate || !endDate) {
                return res.status(400).json({ message: "startDate and endDate are required" });
            };
        const start = new Date(startDate);
        const end = new Date(endDate);

        const room = await prisma.room.findUnique({
            where:{
                AND: [
                    {hotel_id: hotel_id},
                    {id: room_id}
                ]
            }
            });

        // 1. חישוב ההפרש במילישניות
        const differenceInMs = end.getTime() - start.getTime();

        // 2. המרה לימים (חלוקה במספר המילישניות שקיימות ביום)
        const millisecondsInDay = 1000 * 60 * 60 * 24;
        const totalDays = Math.ceil(differenceInMs / millisecondsInDay); // Math.ceil מעגל למעלה למקרה של חלקי ימים

        // הגנה קטנה: ודא שההזמנה היא לפחות ליום אחד
        const daysToCharge = totalDays <= 0 ? 1 : totalDays;

        // 3. שליפת מחיר החדר והפיכתו למספר (מכיוון שהוא חוזר כ-Decimal מפריזמה)
        const roomPrice = Number(room.price);

        // 4. חישוב המחיר הסופי
        const total_price = daysToCharge * roomPrice;

        const reserveRoom = await prisma.reservation.create({
            data: {
                    user_id: user_id, // שימוש ב-id שחולץ מהטוקן
                    hotel_id: hotel_id,
                    room_id: room_id,
                    start_date: start,
                    end_date: end,
                    total_price: total_price
                }
    });
    res.status(200).json({message: "Room booked successfully",
        details: reserveRoom
    }
    )
    } catch(err){
        next(err);
    }

});

// Errors middleware
app.use((err, req, res, next) => {
    // מדפיס את השגיאה המלאה לטרמינל שלך בשביל ה-Debugging
    console.error("Backend Error:", err.stack || err);

    // קביעת סטטוס קוד - אם אין סטטוס קיים, נותנים 500 (שגיאת שרת פנימית)
    const statusCode = err.statusCode || 500;
    
    // שליחת תשובה אחידה ומסודרת ל-Frontend
    res.status(statusCode).json({
        error: true,
        message: err.message || "An unexpected server error occurred",
        // אופציונלי: מציג את ה-stack רק בסביבת פיתוח (development) ולא בפרודקשן
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));