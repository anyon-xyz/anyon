import fetch from "node-fetch";

const request = async <T>(endpoint: string, method: "POST" | "GET" = "GET") => {
  const response = await fetch(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      cookie:
        "sessionid=9888bcfff3d7768443400dcc; timezoneOffset=-10800,0; _ga=GA1.2.85028810.1675641493; Steam_Language=portuguese; browserid=2649840941439871579; steamCountry=BR%7C052993e33a858e0ff8231f3914c27b59; steamLoginSecure=76561198330781179%7C%7CeyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInI6MENFRl8yMjA5MzQ1QV82NzgzMiIsICJzdWIiOiAiNzY1NjExOTgzMzA3ODExNzkiLCAiYXVkIjogWyAid2ViIiBdLCAiZXhwIjogMTY3NjEzMDM3NiwgIm5iZiI6IDE2Njc0MDI0NjQsICJpYXQiOiAxNjc2MDQyNDY0LCAianRpIjogIjBDRjZfMjIwRDgyQ0RfRDg3NzAiLCAib2F0IjogMTY3NTY5OTcxOCwgInJ0X2V4cCI6IDE2OTM1MDkxOTQsICJwZXIiOiAwLCAiaXBfc3ViamVjdCI6ICIxNzcuNzMuMjA1LjIxOCIsICJpcF9jb25maXJtZXIiOiAiMTc3LjczLjIwNS4yMTgiIH0.eboxBwng9_eyR8Mk6qt1d_QaW59-Tv5ZsKoyBGx-nx6ZNSqVmW1FOgfw8gist1yEAyVeWS3v-osyPXrzkRv0AQ; _gid=GA1.2.1970904969.1676042467; strInventoryLastContext=730_2",
    },
  });

  const data = (await response.json()) as T;

  if (response.ok) {
    return data;
  }
  return Promise.reject(new Error(`No data"`));
};

export { request };
