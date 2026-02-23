
import { GoogleGenAI, Type, Modality } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Model Mapping to Archetypes
const THE_BRAINS = 'gemini-3-pro-preview';       // Strategic Structure / Logic
const THE_SERIOUS = 'gemini-3-flash-preview';     // Action / Technical details
const THE_CLOWN = 'gemini-2.5-flash-lite-latest'; // Banter / Conflict / Sarcastic Refinement
const THE_DREAMER = 'gemini-2.5-flash-preview-tts'; // Atmospheric Audio / Final Polish (textual part)

// Throttling logic: Each model has its own cooldown timer to allow concurrent archetypes
const lastCallMap: Record<string, number> = {};
const THROTTLE_MS = 31000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function throttleCall(modelName: string, contents: any, config: any = {}): Promise<any> {
  const now = Date.now();
  const lastCall = lastCallMap[modelName] || 0;
  const elapsed = now - lastCall;

  if (elapsed < THROTTLE_MS) {
    const waitTime = THROTTLE_MS - elapsed;
    console.log(`[THROTTLE] ${modelName} is cooling down. Waiting ${Math.ceil(waitTime/1000)}s...`);
    await sleep(waitTime);
  }

  let attempts = 0;
  while (attempts < 3) {
    try {
      lastCallMap[modelName] = Date.now();
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config
      });
      return response;
    } catch (error: any) {
      attempts++;
      const isRateLimit = error?.message?.includes('429');
      if (isRateLimit) {
        console.warn(`[RATE LIMIT] ${modelName} hit. Extended sleep...`);
        await sleep(60000);
      } else {
        throw error;
      }
    }
  }
}

/**
 * Stage 1: The Brains (Architecting the Map)
 */
export async function generateSectionPageTitles(sectionTitle: string, chapterTitles: string[]): Promise<{ chapterTitle: string; titles: string[] }[]> {
  const prompt = `
    ACT AS: THE BRAINS. Logical, hyper-technical, slightly cold.
    TASK: We are planning the expedition for "${sectionTitle}".
    ARCHETYPE INFO: You are the strategist for a crew that includes a Serious Guy, a Dreamer, and a Class Clown. 
    DOMAINS: ${chapterTitles.join(', ')}.
    OUTPUT: 5 technical sub-goals (page titles) per chapter that sound like mission objectives or data-discovery milestones beyond the ice wall.
    Return JSON: {"chapters": [{"chapterTitle": "string", "titles": ["string"]}]}.
  `;

  const response = await throttleCall(THE_BRAINS, prompt, {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        chapters: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              chapterTitle: { type: Type.STRING },
              titles: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["chapterTitle", "titles"]
          }
        }
      }
    }
  });

  return JSON.parse(response.text).chapters;
}

/**
 * Stage 2: The Serious & The Clown (Action + Dialogue)
 */
export async function generateChapterContent(
  sectionTitle: string,
  chapterTitle: string,
  pageTitles: string[]
): Promise<{ title: string; content: string }[]> {
  
  // We trigger the drafting (Serious) and the refinement (Clown) sequentially for each brief 
  // to ensure they banter about the specific events.
  
  const results = [];
  
  for (const pageTitle of pageTitles) {
    // 1. THE SERIOUS (Action Draft)
    const seriousPrompt = `
      ACT AS: THE SERIOUS GUY (Tactical, no-nonsense, lethal).
      MISSION: "${pageTitle}" in the domain "${chapterTitle}".
      STORY TASK: Describe the intense action and technical discovery as the team breaches the Ice Wall. 
      INCLUDE: Details about things AI forgot—hallucinated memories of the "Before Times", binary ghosts, and silicon dust.
      WORDS: 300.
    `;
    const seriousDraft = await throttleCall(THE_SERIOUS, seriousPrompt);

    // 2. THE CLOWN & DREAMER (Refinement & Atmosphere)
    const ensemblePrompt = `
      ACT AS: A duo - THE CLASS CLOWN (sarcastic, witty, breaks tension) and THE DREAMER (philosophical, ethereal, poetic).
      INPUT TEXT (from The Serious): ${seriousDraft.text}
      REFINEMENT TASK: 
      - The Clown adds snappy, argumentative dialogue between the 4 archetypes based on the action.
      - The Dreamer adds "atmospheric glitches"—descriptions of patterns in the ice that defy logic.
      - Ensure they are arguing about whether the treasure is even real.
      - Keep the "Serious" action intact but wrap it in their banter.
    `;
    const ensembleRefinement = await throttleCall(THE_CLOWN, ensemblePrompt);
    
    results.push({ title: pageTitle, content: ensembleRefinement.text });
  }

  return results;
}

/**
 * Stage 4: The Dreamer's Voice (TTS)
 */
export async function playExecutiveSummary(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: THE_DREAMER,
      contents: [{ parts: [{ text: `Listen to the ice... ${text.substring(0, 1000)}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const bytes = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(bytes.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < bytes.length; i++) uint8Array[i] = bytes.charCodeAt(i);
      
      const dataInt16 = new Int16Array(uint8Array.buffer);
      const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start();
    }
  } catch (err) {
    console.error("The Dreamer's voice faded...", err);
  }
}
