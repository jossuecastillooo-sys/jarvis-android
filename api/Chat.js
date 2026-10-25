
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "Método no permitido."
    });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: "Falta configurar OPENROUTER_API_KEY en Vercel."
    });
  }

  try {
    const message =
      typeof req.body?.message === "string"
        ? req.body.message.trim()
        : "";

    if (!message) {
      return res.status(400).json({
        error: "Escribe una pregunta."
      });
    }

    if (message.length > 4000) {
      return res.status(413).json({
        error: "La pregunta es demasiado larga."
      });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Title": "JARVIS Android"
        },
        body: JSON.stringify({
          model: "openrouter/auto",
          messages: [
            {
              role: "system",
              content:
                "Eres JARVIS, un asistente personal para Android. Responde en español natural, con claridad, inteligencia, precisión y un tono profesional. Ayuda con tecnología, estudios, planificación y preguntas generales. No inventes datos ni afirmes que puedes controlar funciones del teléfono si no tienes herramientas para hacerlo."
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error:
          data?.error?.message ||
          "El proveedor de inteligencia artificial rechazó la solicitud."
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(502).json({
        error: "La IA no devolvió una respuesta válida."
      });
    }

    return res.status(200).json({
      reply: reply
    });

  } catch (error) {
    return res.status(500).json({
      error: "No se pudo conectar con el servicio de inteligencia artificial."
    });
  }
}
