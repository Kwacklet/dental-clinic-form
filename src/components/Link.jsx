import { navigate } from '../utils/navigation'

// A normal <a> link that changes pages without reloading the app.
function Link({ to, children, onClick, ...props }) {
  function handleClick(event) {
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
