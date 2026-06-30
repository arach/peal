import { HudsonThemeScript } from 'hudsonkit/theme-script'
import 'hudsonkit/styles'
import PealNav from '@/components/PealNav'

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <HudsonThemeScript defaultTheme="dark" defaultTemplate="hudson" />
      <PealNav />
      <div className="h-[calc(100vh-52px)] overflow-hidden">{children}</div>
    </>
  )
}