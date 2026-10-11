import ToothIcon from './ToothIcon'

function AppHeader({ clinicName }) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <ToothIcon size={22} />
        <span className="app-header-title">{clinicName}</span>
      </div>
    </header>
  )
}

export default AppHeader
