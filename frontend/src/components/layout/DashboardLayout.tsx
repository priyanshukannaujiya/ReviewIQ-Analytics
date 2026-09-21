import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  MessageSquare,
  AlertTriangle,
  BarChart,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react'
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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-slate-200 bg-white shadow-soft z-10">
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
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header - Optional, for now just a spacer on desktop */}
        <header className="bg-white border-b border-slate-200 lg:hidden shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="ReviewIQ Logo" className="h-7 w-7 object-contain" />
              <span className="text-xl font-bold text-slate-900 tracking-tight">ReviewIQ</span>
            </div>
            <button className="text-slate-500 hover:text-slate-600">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-slate-50 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
