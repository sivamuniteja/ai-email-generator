import type { EmailInputs } from "./promptBuilder";

const API_URL = "";

export async function streamEmailWithBackend(
  inputs: EmailInputs,
  onChunk: (chunk: string) => void
): Promise<string> {
  const response = await fetch(`${API_URL}/api/email/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(inputs),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder("utf-8");
  let fullContent = "";

  if (reader) {
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value, { stream: true });
      
      const lines = chunkValue.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.replace("data: ", "").trim();
          if (dataStr === "[DONE]") {
            done = true;
            break;
          }
          try {
            const data = JSON.parse(dataStr);
            if (data.text) {
              fullContent += data.text;
              onChunk(fullContent);
            }
          } catch (e) {
            // Ignore parse errors from incomplete chunks if any
          }
        }
      }
    }
  }

  return fullContent;
}

export async function streamEmailImprovementWithBackend(
  currentEmail: string,
  action: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  const response = await fetch(`${API_URL}/api/email/improve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currentEmail, action }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder("utf-8");
  let fullContent = "";

  if (reader) {
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value, { stream: true });
      
      const lines = chunkValue.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.replace("data: ", "").trim();
          if (dataStr === "[DONE]") {
            done = true;
            break;
          }
          try {
            const data = JSON.parse(dataStr);
            if (data.text) {
              fullContent += data.text;
              onChunk(fullContent);
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
  }

  return fullContent;
}
