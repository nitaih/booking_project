export function authHeaders(extraHeaders = {}){

    const token = localStorage.getItm("token");
    if(!token) {throw new Error("Token is missing")};

    return {
        Authorization: `Bearer ${token}`,
        ...extraHeaders
    }

}