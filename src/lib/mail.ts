type Attachment = { filename: string; content: string };

// Sends an email through the school's mail relay.
export async function sendMail(message: {
  to: string;
  subject: string;
  text?: string;
  attachments?: Attachment[];
}) {
  const response = await fetch(process.env.MAIL_RELAY_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MAIL_RELAY_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
  if (!response.ok) {
    throw new Error(`Mail relay returned ${response.status}`);
  }
}
