export interface EmailInputs {
  purpose: string;
  recipient: string;
  sender?: string;
  subject: string;
  context: string;
  tone: string;
  length: string;
  language: string;
}

export function buildPrompt(inputs: EmailInputs): string {
  return `Generate a high-quality email.

Purpose:
${inputs.purpose}

Recipient:
${inputs.recipient}

Subject Context:
${inputs.subject}

Tone:
${inputs.tone}

Length:
${inputs.length}

Language:
${inputs.language}

Context:
${inputs.context}

Sender:
${inputs.sender || "[Sender Name]"}

Requirements:
- Write naturally in ${inputs.language}.
- Avoid robotic wording.
- Use a proper greeting.
- Write a meaningful body.
- End professionally.

Format your output exactly like this:
SUBJECT: Here goes the subject
BODY:
Here goes the email body...`;
}
