import express from "express";
import cors from "cors";
import prisma from "./db_prisma.js";
import {hashPassword, validatePassword, createToken, auth, requiredRole} from "./auth.js";

const app = express();


app.use(cors({origin:"http://localhost:5173"}));
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

// add new hotel
app.post("/api/hotels", auth, requiredRole(["admin"]), async (req, res, next) => {
    try{
        const {name, stars, country, city, number_of_rooms, image_url} = req.body;

        // 1. הגנה: בדיקת שדות חובה (שלא שלחו ערכים ריקים או undefined)
        if (!name || !country || !city || stars === undefined || number_of_rooms === undefined) {
            return res.status(400).json({ message: "Missing required fields: name, country, city, stars, and number_of_rooms are mandatory." });
        };
        // 2. הגנה: תקינות טווח כוכבים (למשל, בין 1 ל-5 כוכבים)
        const starsNum = Number(stars);
        if (isNaN(starsNum) || starsNum < 1 || starsNum > 5) {
            return res.status(400).json({ message: "Stars must be a number between 1 and 5." });
        };
        // 3. הגנה: תקינות מספר חדרים (חייב להיות מספר חיובי)
        const roomsNum = Number(number_of_rooms);
        if (isNaN(roomsNum) || roomsNum < 1) {
            return res.status(400).json({ message: "Number of rooms must be a valid positive number." });
        };
        // 4. הגנה מפני כפילויות: האם יש כבר מלון בשם הזה באותה העיר?
        const existingHotel = await prisma.hotel.findFirst({
            where: {
                name: { equals: name, mode: 'insensitive' }, // בדיקה לא רגישה לאותיות גדולות/קטנות
                city: { equals: city, mode: 'insensitive' }
            }
        });

        if (existingHotel) {
            return res.status(409).json({ message: "A hotel with this name already exists in this city." });
        }

        const newHotel = await prisma.hotel.create({
            data: {
                name,
                stars: starsNum,
                country,
                city,
                number_of_rooms: roomsNum,
                image_url: image_url || null
            }
        });
        return res.status(201).json({
            message: "Hotel added to database successfully",
            details: newHotel
        });
    } catch(err){
        next(err);
    }
    
} );

// add new room By hotel ID
app.post("/api/hotels/:hotelId/rooms", auth, requiredRole(["admin"]), async (req, res, next) => {
    try {
        const hotelId = Number(req.params.hotelId);
        const { name, max_guests, price, size, image_url} = req.body;
        // 1. הגנה: בדיקת שדות חובה (שלא שלחו ערכים ריקים או undefined)
        if (!name || max_guests === undefined || price === undefined || size === undefined) {
            return res.status(400).json({ message: "Missing required fields: name, max_guests, price, size are mandatory." });
        };
        // מספר אורחים חייב להיות חיובי
        const maxGuests = Number(max_guests);
        if (isNaN(maxGuests) || maxGuests < 1) {
            return res.status(400).json({ message: "Number of guests must be a valid positive number." });
        };
        // מחיר חייב להיות חיובי
        const isPriceCorrect = Number(price);
        if (isNaN(isPriceCorrect) || isPriceCorrect < 0) {
            return res.status(400).json({ message: "The price must be a valid positive number." });
        };
        const isSizeCorrect = Number(size);
        if (isNaN(isSizeCorrect) || isSizeCorrect < 1) {
            return res.status(400).json({ message: "Room size must be a valid positive number." });
        };

        const existingRoom = await prisma.room.findFirst({
            where: {
                hotel_id: hotelId,
                name: { equals: name, mode: 'insensitive' }
            }
        });
        if(existingRoom) return res.status(409).json({ message: "A room with this name already exists in this hotel." });

        const newRoom = await prisma.room.create({
            data: {
                hotel_id: hotelId,
                name,
                max_guests, 
                price,
                size,
                image_url
            }
        });

        return res.status(201).json({
            message: `Room added successfully to hotel ID - ${hotelId}`,
            details: newRoom
        })
        
    } catch (error) {
        next(error);
    }
    
})
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
        console.log("Headers:", req.headers['content-type']);
        console.log("Body:", req.body);
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
        console.log("Headers:", req.headers['content-type']);
        console.log("Body:", req.body);
        const user_id = req.user_id;
        const {startDate, endDate} = req.body;
        const hotel_id = Number(req.params.hotel_id);
        const room_id = Number(req.params.room_id);
            if (!startDate || !endDate) {
                return res.status(400).json({ message: "startDate and endDate are required" });
            };
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();

        now.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        // 2. הגנה: ודא שתאריך הכניסה הוא מהיום והלאה
        if (start < now) {
            return res.status(400).json({ message: "Reservation start date must be today or in the future" });
        }

        // 3. הגנה: ודא שתאריך העזיבה הוא אחרי תאריך הכניסה
        if (end <= start) {
            return res.status(400).json({ message: "End date must be after the start date" });
        }

        const room = await prisma.room.findFirst({
            where:{
                AND: [
                    {hotel_id: hotel_id},
                    {id: room_id}
                ]
            }
            });
        if (!room) {
            return res.status(404).json({ message: "Room not found in this hotel" });
        };
        // 5. הגנה קריטית: בדיקה האם החדר כבר תפוס בתאריכים האלו
        // לוגיקת חפיפה: הזמנה קיימת חופפת אם (Start A < End B) וגם (End A > Start B)
        const conflictingReservation = await prisma.reservation.findFirst({
            where: {
                room_id: room_id,
                AND: [
                    { start_date: { lt: end } },  // תאריך התחלה של ההזמנה הקיימת קטן מתאריך הסיום המבוקש
                    { end_date: { gt: start } }   // תאריך סיום של ההזמנה הקיימת גדול מתאריך ההתחלה המבוקש
                ]
            }
        });
        if (conflictingReservation) {
            return res.status(409).json({ message: "The room is already booked for the selected dates" });
        }

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
    res.status(200).json({message:"Room booked successfully",
        details: reserveRoom
    }
    )
    } catch(err){
        next(err);
    }

});

//get reservation by user ID
app.get("/api/users/:userId/reservations", auth, async (req, res, next) => {
    try {

        const userId = Number(req.params.userId);
        // 1. הגנה: בדיקה שהמשתמש המחובר מבקש את המידע של עצמו בלבד
        // (בהנחה שמידלוור ה-auth שומר את ה-ID המוצפן ב-req.user.id)
        if (req.user_id !== userId) {
            return res.status(403).json({ message: "אין לך הרשאה לצפות בהזמנות אלו" });
        };

        const userReservations = await prisma.reservation.findMany({
            where: {user_id: userId, status: {not: "CANCELLED"}},
            include: {
                hotel: true // אומר לפריזמה להביא את כל אובייקט המלון (ודא שהקשר בסכמה נקרא hotel)
            },
            orderBy: {
                created_at: 'desc'
            }
        });
        if(userReservations.length === 0) return res.status(200).json({message: "No reservations"});

        return res.status(200).json(userReservations);
    } catch (error) {
        next(error);
    }
    
});

// edit reservation by id
app.patch("/api/users/:userId/reservations/:resId", auth, async (req, res, next) => {
    try {
        const urlUserId = Number(req.params.userId);
        const reservationId = Number(req.params.resId); 

        // 1. הגנה: בדיקת הרשאה (שהמשתמש מעדכן את של עצמו)
        if (req.user_id !== urlUserId) {
            return res.status(403).json({ error: "אין לך הרשאה לערוך הזמנה זו" });
        }

        // 2. הגנה: בדיקת תקינות תאריכים בסיסית (חובה שיישלחו תאריכים)
        if (!req.body.start_date || !req.body.end_date) {
            return res.status(400).json({ error: "יש לספק תאריך התחלה ותאריך סיום" });
        }

        if (new Date(req.body.start_date) >= new Date(req.body.end_date)) {
            return res.status(400).json({ error: "תאריך הסיום חייב להיות אחרי תאריך ההתחלה" });
        }

        // 3. שליפת נתוני ההזמנה הנוכחית מה-DB
        const currentReservation = await prisma.reservation.findUnique({
            where: { id: reservationId }
        });

        if (!currentReservation || currentReservation.deleted_at !== null) {
            return res.status(404).json({ error: "ההזמנה לא נמצאה או שבוטלה" });
        }

        // --- חילוץ מזהה החדר מההזמנה שתחת עריכה ---
        const targetRoomId = currentReservation.room_id; 
        
        const targetStartDate = new Date(req.body.start_date);
        const targetEndDate = new Date(req.body.end_date);

        // 4. חיפוש הזמנות חופפות (הגנת כפל הזמנות על אותו חדר)
        const conflictingReservation = await prisma.reservation.findFirst({
            where: {
                room_id: targetRoomId,      // משתמשים במזהה החדר שחולץ מההזמנה ב-DB
                deleted_at: null, 
                id: { not: reservationId }, // מתעלמים מההזמנה הנוכחית של המשתמש
                AND: [
                    { start_date: { lt: targetEndDate } },
                    { end_date: { gt: targetStartDate } }
                ]
            }
        });

        if (conflictingReservation) {
            return res.status(409).json({ error: "החדר כבר מוזמן בתאריכים החדשים המבוקשים" });
        }

        // 5. ביצוע העדכון (רק של התאריכים!)
        const updateResult = await prisma.reservation.updateMany({
            where: {
                id: reservationId,
                user_id: urlUserId,
                deleted_at: null
            },
            data: {
                start_date: targetStartDate,
                end_date: targetEndDate
            }
        });

        if (updateResult.count === 0) {
            return res.status(404).json({ error: "עדכון ההזמנה נכשל" });
        }

        // שליפת הנוסח המעודכן לחזרה ל-Frontend
        const updatedReservation = await prisma.reservation.findUnique({
            where: { id: reservationId }
        });

        return res.status(200).json({
            message: "ההזמנה עודכנה בהצלחה לתאריכים החדשים!",
            reservation: updatedReservation
        });
    } catch (error) {
        next(error);
    }
    
});

// delete reservation by id
app.delete("/api/users/:userId/reservations/:resId", auth, async (req, res, next) => {
    try {
        const urlUserId = Number(req.params.userId);
        const reservationId = Number(req.params.resId); 

        // 1. הגנה: בדיקת הרשאה (שהמשתמש מעדכן את של עצמו)
        if (req.user_id !== urlUserId) {
            return res.status(403).json({ error: "אין לך הרשאה לערוך הזמנה זו" });
        };
        // 2. הגנה: בדיקה אם קיימת הזמה עם ה ID
        const currentReservation = await prisma.reservation.findFirst({
            where: { id: reservationId }
        });

        if (!currentReservation || currentReservation.deleted_at !== null) {
            return res.status(404).json({ error: "ההזמנה לא נמצאה או שבוטלה" });
        };

        const deleteReservation = await prisma.reservation.update({
            where: {id: reservationId},
            data: {deleted_at: new Date(),
                status: "CANCELLED"
            }
        });
        return res.status(200).json({
            message: "reservation removed",
            details: deleteReservation
        })
    } catch (error) {
        next(error);
    }
})

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

app.listen(8000, () => console.log("Server running on http://localhost:8000"));