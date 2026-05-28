export function authHeaders(extraHeaders = {}){

    const token = localStorage.getItem("token");
    if(!token) {throw new Error("Token is missing")};

    return {
        Authorization: `Bearer ${token}`,
        ...extraHeaders
    }

}