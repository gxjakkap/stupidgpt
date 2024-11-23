import * as React from 'react'
import Link from 'next/link'
import EnvCard from './cards/envcard'

export async function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-white ">  
      <EnvCard />
      <Link href="/" rel="nofollow" className="mr-2 font-bold">
        StupidLLM
      </Link>
      <a className='text-gray-400' href='https://github.com/gxjakkap/' target='_blank' rel='noopener,noreferrer'>guntxjakka</a>
    </header>
  )
}
