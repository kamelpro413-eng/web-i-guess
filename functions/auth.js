// netlify/functions/auth.js
import fetch from "node-fetch";

export async function handler(event) {
  const CLIENT_ID = "1411025062680854588";        // from Discord Dev Portal
  const CLIENT_SECRET = "wsPXtDuR4v0_oJCybYyUy5Lgm7ghpdiF"; // from Discord Dev Portal
  const REDIRECT_URI = "https://ticketlogger.netlify.app/.netlify/functions/auth/callback";

  // LOGIN STEP
  if (event.path.endsWith("/login")) {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=code&scope=identify%20guilds`;
    return {
      statusCode: 302,
      headers: { Location: url },
    };
  }

  // CALLBACK STEP
  if (event.path.endsWith("/callback")) {
    const code = new URLSearchParams(event.queryStringParameters).get("code");

    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        scope: "identify guilds",
      }),
    });

    const tokenData = await tokenResponse.json();
    const access_token = tokenData.access_token;

    return {
      statusCode: 302,
      headers: {
        "Set-Cookie": `token=${access_token}; Path=/; HttpOnly`,
        Location: "/dashboard.html",
      },
    };
  }

  // SERVERS STEP
  if (event.path.endsWith("/servers")) {
    const token = event.headers.cookie?.split("token=")[1];
    if (!token) return { statusCode: 401, body: "[]" };

    const response = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const guilds = await response.json();
    return { statusCode: 200, body: JSON.stringify(guilds) };
  }

  return { statusCode: 404, body: "Not found" };
}
