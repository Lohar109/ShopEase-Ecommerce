
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import Header from './components/Header';
import AppRouter from './router';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 1600 }} />
      <Header />
      <AppRouter />
    </BrowserRouter>
  )
}

export default App
