import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'
import { PortfolioChatWidget } from '../chat/PortfolioChatWidget'
import { CommandPalette } from '../common/CommandPalette'

export function SiteLayout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      <PortfolioChatWidget />
      <CommandPalette />
    </>
  )
}
