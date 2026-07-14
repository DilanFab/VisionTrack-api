import fetch from "node-fetch";

interface PushPayload {
  token: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export const enviarPushExpo = async ({ token, title, body, data = {} }: PushPayload) => {
  const message = {
    to: token,
    sound: "default",
    title,
    body,
    data,
  };

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Expo Push error: ${response.status} - ${text}`);
  }

  return response.json();
};
