import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { navigate } from '../utils/navigation'

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }

// A normal <a> link that changes pages without reloading the app.
function Link({ to, children, onClick, ...props }: LinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    // Let Ctrl/Cmd-click and middle-click open a new tab as usual.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) return
    event.preventDefault()
    navigate(to)
  }

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}

export default Link
