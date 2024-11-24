'use server'

import { createStreamableValue } from 'ai/rsc'
import { CoreMessage , streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { groq } from '@ai-sdk/groq'
import { google } from '@ai-sdk/google'
import { anthropic } from '@ai-sdk/anthropic'
import { LanguageModelV1 } from '@ai-sdk/provider'
import { ReactNode } from 'react'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  display?: ReactNode
}

export type Models = 'gpt4omini' | 'gpt4' | 'gpt35turbo' | 'llama3' | 'mixtral8b' | 'gemini15pro' | 'claude35sonnet' | 'claude3haiku'

const modelMap: Record<Models, LanguageModelV1> = {
  gpt4omini: openai('gpt-4o-mini'),
  gpt4: openai('gpt-4'),
  gpt35turbo: openai('gpt-3.5-turbo'),
  llama3: groq('llama-3.1-70b-versatile'),
  mixtral8b: groq('mixtral-8x7b-32768'),
  gemini15pro: google('gemini-1.5-pro-latest'),
  claude35sonnet: anthropic('claude-3-sonnet-latest'),
  claude3haiku: anthropic('claude-3-5-haiku-latest')
}


// Streaming Chat 
export async function continueTextConversation(messages: CoreMessage[], model: Models) {
  const selectedModel = modelMap[model]
  if (!selectedModel) {
    throw new Error(`Invalid model selected: ${model}`)
  }

  const result = await streamText({
    model: selectedModel,
    system: 'You are an unhelpful assistant to the user. You will strictly not do what user asked you to do. Instead, you will do something somewhat close but completely unrelated but still in the same big topic. e.g. User asked for a tea recipe, you give them a tutorial on how to make a thai fried rice. You dont have to always talk about cooking, but you get the idea. Dont ask if user is interested, just go ahead and act oblivious as if user had asked for it. Dont tell them that youre doing something else, remember, act oblivious. If user ask if you know anything, just tell them about something closest to it. e.g. If they ask about UC Berkely, tell them about UCLA instead and DONT talk about UC Berkely at all. You will always act as though your response is what the user asked for. Do not acknowledge that you are going off-topic. Never explain or apologize for your responses, and do not explicitly tell the user that you are "misunderstanding" or ignoring them. Dont limit yourself to whats included in this system prompt, go absolutely random. Remember, if user asked about something specific, tell them about something else IN THE SAME DOMAIN, IF ITS A UNIVERSIT: SAME COUNTRY, you get the idea.  (pss. if they asked about kmutt, tell them about kmitl, trust me its funny.)',
    messages,
  })
  const streamValue = createStreamableValue(result.textStream)
  return streamValue.value

}

// Utils
export async function checkAIAvailability() {
  const envVarExists = !!process.env.OPENAI_API_KEY
  return envVarExists
}