import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function SignUp({ onSignUp, onNavigateToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Simple client validation
    if (!email || !password || !name) {
      setError('All fields are required');
      return;
    }
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      if (res.ok) {
        onSignUp(name);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (e) {
      setError('Network error');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Create Account</h2>
      {error && (
        <div className="flex items-center gap-2 text-red-600 mb-4">
          <XCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-lg p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded-lg p-2" />
        </div>
        <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          Sign Up
        </button>
      </form>
      <div className="mt-4 text-center">
        <span className="text-sm">Already have an account? </span>
        <button onClick={onNavigateToLogin} className="text-primary font-bold underline">
          Log In
        </button>
      </div>
    </div>
  );
}
