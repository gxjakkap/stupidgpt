'use client'

import { useEffect, useState } from 'react'
import { readStreamableValue, StreamableValue } from 'ai/rsc'
import SyntaxHighlighter from "react-syntax-highlighter"
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs"
import ReactMarkdown from 'react-markdown'

import { type CoreMessage } from 'ai'

import { continueTextConversation, Models } from '@/app/actions'

import { Card } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { IconArrowUp } from '@/components/ui/icons'
import AboutCard from "@/components/cards/aboutcard"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"


export const maxDuration = 30


interface ModelForDropdown {
  id: Models,
  name: string,
  disabled?: boolean,
  defaultChecked?: boolean
}

const models: ModelForDropdown[] = [
  { id: 'gpt4omini', name: 'GPT-4o Mini' },
  { id: 'gpt4', name: 'GPT-4' },
  { id: 'gpt35turbo', name: 'GPT-3.5 Turbo' },
  { id: 'gemini15pro', name: 'Gemini 1.5 Pro' },
  { id: 'mixtral8b', name: 'Mixtral 8b' },
  { id: 'claude35sonnet', name: 'Claude 3.5 Sonnet', disabled: true },
  { id: 'claude3haiku', name: 'Claude 3 Haiku', disabled: true },
  { id: 'llama3', name: 'LLama3', defaultChecked: true },
]

export default function Chat() {
  const [messages, setMessages] = useState<CoreMessage[]>([])
  const [input, setInput] = useState<string>('')
  const [model, setModel] = useState<ModelForDropdown>({ id: 'llama3', name: 'LLama3', defaultChecked: true })
  const [firstLoad, setFirstLoad] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newMessages: CoreMessage[] = [
      ...messages,
      { content: input, role: 'user' },
    ];
    setMessages(newMessages);
    setInput('');
    const result = await continueTextConversation(newMessages, model.id)
    for await (const content of readStreamableValue(result as StreamableValue)) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: content as string, 
        },
      ]);
    }
  }

  useEffect(() => {
    if (!firstLoad) return
    setFirstLoad(false)
    setModel(models.find(m => m.id === (localStorage.getItem('model') as Models)) || { id: 'llama3', name: 'LLama3', defaultChecked: true })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (firstLoad) return
    localStorage.setItem('model', model.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model])
  
  return (    
    <div className="group w-full overflow-auto ">
      {messages.length <= 0 ? ( 
        <AboutCard />  
      ) 
      : (
        <div className="max-w-xl mx-auto mt-10 mb-24">
          {messages.map((message, index) => (
            <div key={index} className="whitespace-pre-wrap flex mb-5">
              <div className={`${message.role === 'user' ? 'bg-slate-200 ml-auto' : 'bg-transparent'} p-2 rounded-lg`}>
                <ReactMarkdown
                  components={{
                    code({ node, className, children, inline, ...props}: any){
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vs2015}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content as string}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="fixed inset-x-0 bottom-10 w-full ">
        <div className="w-full max-w-xl mx-auto">
          <Card className="p-2">
            <form onSubmit={handleSubmit}>
              <div className="flex">
                <Textarea
                  value={input}
                  onChange={event => {
                    setInput(event.target.value);
                  }}
                  className="resize-none border-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (e.shiftKey) {
                        // Allow Shift+Enter to create a new line
                        return;
                      }
                      // Prevent default behavior and submit the form
                      e.preventDefault();
                      if (input.trim()) {
                        handleSubmit(new Event('submit') as unknown as React.FormEvent) // Simulate form submission
                      }
                    }
                  }}
                  placeholder='Ask me anything...'
                />
                <DropdownMenu>
                  <DropdownMenuTrigger className="px-4">
                    <Button variant="outline">{model.name}</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuRadioGroup value={model.id} onValueChange={(val) => setModel(models.find(m => m.id === val) || { id: 'llama3', name: 'LLama3', defaultChecked: true })}>
                      {models.map((m, i) => (
                          <DropdownMenuRadioItem value={m.id} key={i} disabled={m.disabled || false} defaultChecked={m.defaultChecked || false}>{m.name}</DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button disabled={!input.trim()} className="my-auto">
                  <IconArrowUp />
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
