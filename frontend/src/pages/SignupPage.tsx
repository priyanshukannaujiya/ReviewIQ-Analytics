import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    company_name: '',
  })
  const [error, setError] = useState('')
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    try {
      await signup(form)
      navigate('/dashboard')
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((e: any) => e.msg).join(', '));
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Unable to create your account.');
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-xl font-bold text-white">R</div>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Create your account</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Full Name</label>
            <input value={form.full_name} onChange={(e) => handleChange('full_name', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-500" required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-500" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-500" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</label>
            <input type="password" value={form.confirm_password} onChange={(e) => handleChange('confirm_password', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-500" required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Company Name</label>
            <input value={form.company_name} onChange={(e) => handleChange('company_name', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-500" required />
          </div>

          {error && <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

          <button type="submit" className="md:col-span-2 w-full rounded-xl bg-brand-500 px-4 py-3 font-semibold text-white shadow-soft transition hover:bg-brand-600">
            Create account
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="font-semibold text-brand-600">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
