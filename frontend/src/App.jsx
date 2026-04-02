


import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Header from './components/Header';
import MainPage from './components/MainPage';




function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header />
      <MainPage />
    </>
  )
}

export default App
