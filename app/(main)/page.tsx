import { UserButton } from '@clerk/nextjs'

import { ThemeToggle } from '@/components/theme-toggle'

const Home = () => {
  return (
    <main className='flex h-full items-center justify-center gap-4'>
      <h1 className='text-3xl font-bold'>NextJS Chat App</h1>
      <UserButton afterSignOutUrl='/' />
      <ThemeToggle />
    </main>
  )
}

export default Home
