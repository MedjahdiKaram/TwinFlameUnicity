export interface AIConfig {
  provider: string
  model: string
  apiKey: string
  temperature: number
}

export interface NanoBananaConfig {
  nanoBananaKey: string
  nanoBananaUrl: string
  nanoBananaModel: string
}

export interface GeneratedMetadata {
  meta_title: string
  meta_description: string
  excerpt: string
}

/**
 * Generates SEO metadata (title, description, excerpt) based on article title and content
 */
export async function generateMetadata(config: AIConfig, title: string, content: string): Promise<GeneratedMetadata> {
  const { provider, model, apiKey, temperature } = config
  if (!apiKey) {
    throw new Error("Clé API manquante. Veuillez configurer l'IA dans les paramètres de l'administration.")
  }

  // Clean HTML from content for a lighter token load
  const cleanContent = content ? content.replace(/<[^>]*>/g, '').substring(0, 4000) : ''
  const prompt = `Génère des métadonnées SEO et un résumé pour l'article suivant :
Titre : "${title}"
Contenu : "${cleanContent}"

Tu DOIS retourner UNIQUEMENT un objet JSON valide, sans balise markdown (pas de \`\`\`json ou de \`\`\`), sans aucun texte superflu avant ou après.
L'objet JSON doit respecter ce format exact :
{
  "meta_title": "Un titre de page accrocheur optimisé SEO de 50 à 60 caractères",
  "meta_description": "Une description méta pertinente et vendeuse de 120 à 150 caractères",
  "excerpt": "Un résumé accrocheur pour la page d'accueil de l'article de 150 à 250 caractères"
}`

  try {
    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          temperature: temperature,
          response_format: { type: 'json_object' },
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error?.message || `Erreur OpenAI: ${response.statusText}`)
      }

      const data = await response.json()
      const resultStr = data.choices[0].message.content
      return JSON.parse(resultStr.trim())
    }

    if (provider === 'gemini') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: temperature,
              responseMimeType: 'application/json',
            },
          }),
        }
      )

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error?.message || `Erreur Gemini: ${response.statusText}`)
      }

      const data = await response.json()
      const text = data.candidates[0].content.parts[0].text
      return JSON.parse(text.trim())
    }

    if (provider === 'claude') {
      // Direct Anthropic client-side call
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'dangerously-allow-html-user-system-messages': 'true',
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 1000,
          temperature: temperature,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error?.message || `Erreur Claude: ${response.statusText}`)
      }

      const data = await response.json()
      const text = data.content[0].text.trim()
      // Extract JSON in case the model ignored directions and returned markdown
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return JSON.parse(text)
    }

    throw new Error(`Fournisseur d'IA non reconnu: ${provider}`)
  } catch (error: any) {
    console.error('AI Generation error:', error)
    throw new Error(error?.message || "Une erreur s'est produite lors de la génération de métadonnées.")
  }
}

/**
 * Generates an image using NanoBanana API
 */
export async function generateImageNanoBanana(config: NanoBananaConfig, prompt: string): Promise<string> {
  const { nanoBananaKey, nanoBananaUrl, nanoBananaModel } = config
  if (!nanoBananaKey) {
    throw new Error("Clé API NanoBanana manquante. Veuillez la configurer dans l'onglet IA des paramètres.")
  }

  try {
    const response = await fetch(nanoBananaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${nanoBananaKey}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        model: nanoBananaModel,
        n: 1,
        size: '1024x1024',
        response_format: 'url',
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Erreur NanoBanana (${response.status}): ${errText || response.statusText}`)
    }

    const data = await response.json()
    const imageUrl = data.data?.[0]?.url || data.url || data.image_url
    if (!imageUrl) {
      throw new Error("L'API NanoBanana n'a pas retourné d'URL d'image.")
    }

    return imageUrl
  } catch (error: any) {
    console.error('NanoBanana generation error:', error)
    throw new Error(error?.message || "Une erreur s'est produite lors de la génération d'image via NanoBanana.")
  }
}
