import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { navigate } from '../utils/navigation'

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }

function Link({ to, children, onClick, ...props }: LinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
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
