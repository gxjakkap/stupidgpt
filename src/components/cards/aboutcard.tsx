import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"

export default function AboutCard() {
  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>StupidLLM</CardTitle>
          <CardDescription>Taking the usefulness out of LLM</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground/90 leading-normal prose"> 
          {/* <p className="mb-3">A simplified Next.js AI starter kit designed with simplicity and speed in mind.</p>
          <p className="mb-3">Built with Next.js, AI SDK, Tailwind, Typescript and shadcn you can build a bare minimum AI Chatbot with only an environment variable. Based off the popular <Link href="https://chat.vercel.ai/">Next AI Chatbot</Link> the aim for this project is to remove any dependency outside of basic functionality and examples with an emphasis on making changes and experimenting with the AI SDK. </p> */}
          <p className="mb-3 font-semibold">To get started:</p>
          <ul className="flex flex-col mb-2">
            <li>→ Choose models below (default: llama3)</li>
            <li>→ Type in your prompt</li>
            <li>→ Enjoy!</li>
            <li></li>
          </ul>
          <p><Link href="https://github.com/gxjakkap/stupidllm" className="underline">Check out our source code and do what you will.</Link> (this app is a fork of <Link href="https://github.com/mattjared/nextjs-ai-lite" className="underline">mattjared/nextjs-ai-lite</Link>) </p>
        </CardContent>
      </Card>
    </div>
  )
}
