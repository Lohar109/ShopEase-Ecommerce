
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import AppRouter from './router';

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 1600 }} />
      <Header />
      <AppRouter />
    </>
  )
}

export default App
