import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  MessageSquare,
  AlertTriangle,
  BarChart,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

interface DashboardLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Reviews', href: '/dashboard/reviews', icon: MessageSquare },
  { name: 'Complaints', href: '/dashboard/complaints', icon: AlertTriangle },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center px-6 border-b border-slate-200 gap-3">
        <img src="/logo.png" alt="ReviewIQ Logo" className="h-8 w-8 object-contain transition-transform duration-300 hover:scale-110 hover:rotate-3" />
        <span className="text-xl font-bold text-slate-900 tracking-tight">ReviewIQ</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-500'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
          <div className="ml-3 flex-1 overflow-hidden">
            <p className="text-sm font-medium text-slate-700 truncate">{user?.name}</p>
            <p className="text-xs font-medium text-slate-500 truncate">{user?.company_name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-auto text-slate-400 hover:text-slate-500 transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white shadow-soft z-10">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-64 bg-white flex flex-col z-50 shadow-2xl lg:hidden"
            >
              <div className="absolute top-0 right-0 -mr-12 pt-4">
                <button
                  type="button"
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 lg:hidden shadow-sm z-30 relative">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="ReviewIQ Logo" className="h-7 w-7 object-contain" />
              <span className="text-xl font-bold text-slate-900 tracking-tight">ReviewIQ</span>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-slate-500 hover:text-slate-600 p-2 -mr-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {/* We wrap children in a motion.div for page transitions */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
