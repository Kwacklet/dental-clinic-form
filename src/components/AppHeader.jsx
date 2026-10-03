import ToothIcon from './ToothIcon'

function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <ToothIcon size={22} />
        <span className="app-header-title">Meg's Clinic</span>
      </div>
    </header>
  )
}

export default AppHeader
