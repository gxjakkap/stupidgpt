'use client';

import { Card } from "@/components/ui/card"
import { type CoreMessage } from 'ai'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { continueTextConversation, Models } from '@/app/actions'
import { readStreamableValue, StreamableValue } from 'ai/rsc'
import { Button } from '@/components/ui/button'
import { IconArrowUp } from '@/components/ui/icons'
import AboutCard from "@/components/cards/aboutcard"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import SyntaxHighlighter from "react-syntax-highlighter"
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs"
import { Textarea } from "./ui/textarea"
export const maxDuration = 30

export default function Chat() {
  const [messages, setMessages] = useState<CoreMessage[]>([])
  const [input, setInput] = useState<string>('')
  const [model, setModel] = useState<Models>("llama3" as Models)
  const [firstLoad, setFirstLoad] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newMessages: CoreMessage[] = [
      ...messages,
      { content: input, role: 'user' },
    ];
    setMessages(newMessages);
    setInput('');
    const result = await continueTextConversation(newMessages, model)
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
    setModel(localStorage.getItem('model') as Models || 'llama3')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (firstLoad) return
    localStorage.setItem('model', model)
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
                  <DropdownMenuTrigger className="px-4">{model}</DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuRadioGroup value={model} onValueChange={setModel as any}>
                      <DropdownMenuRadioItem value="gpt4omini">GPT-4o Mini</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="gpt4">GPT-4</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="gpt35turbo">GPT-3.5 Turbo</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="gemini15pro">Gemini 1.5 Pro</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="mixtral8b">Mixtral 8b</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="claude35sonnet" disabled>Claude 3.5 Sonnet</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="claude3haiku" disabled>Claude 3 Haiku</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem defaultChecked value="llama3">Llama3</DropdownMenuRadioItem>
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
