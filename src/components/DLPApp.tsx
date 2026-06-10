'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { WelcomeScreen } from './WelcomeScreen'
import { MainScreen } from './MainScreen'
import { SummaryScreen } from './SummaryScreen'

export type Screen = 'welcome' | 'main' | 'summary'

export function DLPApp() {
  const store = useStore()
  const [screen, setScreen] = useState<Screen>('welcome')

  if (!store.loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {screen === 'welcome' && (
        <WelcomeScreen store={store} onStart={() => setScreen('main')} />
      )}
      {screen === 'main' && store.current && (
        <MainScreen store={store} onSummary={() => setScreen('summary')} onBack={() => setScreen('welcome')} />
      )}
      {screen === 'summary' && store.current && (
        <SummaryScreen store={store} onBack={() => setScreen('main')} onNew={() => setScreen('welcome')} />
      )}
    </div>
  )
}
