import { AuthProvider } from './context/AuthContext.jsx'
import { TiendaProvider } from './context/TiendaContext.jsx'
import AppRouter from './router/AppRouter.jsx'
import SgiReminders from './components/shared/SgiReminders.jsx'

export default function App() {
  return (
    <AuthProvider>
      <TiendaProvider>
        <SgiReminders />
        <AppRouter />
      </TiendaProvider>
    </AuthProvider>
  )
}