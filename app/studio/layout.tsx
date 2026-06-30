import 'hudsonkit/styles'
import StudioChrome from './StudioChrome'

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <StudioChrome>{children}</StudioChrome>
}