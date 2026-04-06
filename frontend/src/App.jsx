


import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import Header from './components/Header';
import AppRouter from './router';






function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header />
      <AppRouter />
    </>
  )
}

export default App
