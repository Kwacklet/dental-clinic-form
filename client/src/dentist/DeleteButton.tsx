import { useState } from 'react'

interface DeleteButtonProps {
  patientName: string
  onDelete: () => Promise<void>
  small?: boolean
}

// "Delete" button that asks for confirmation before calling onDelete.
function DeleteButton({ patientName, onDelete, small = false }: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const size = small ? 'button-small' : ''

  async function handleConfirm() {
    setDeleting(true)
    try {
      await onDelete()
    } finally {
      setDeleting(false)
      setConfirming(false)
    }
  }

  if (!confirming) {
    return (
      <button type="button" className={`button button-danger ${size}`} onClick={() => setConfirming(true)}>
        Delete
      </button>
    )
  }

  return (
    <span className="delete-confirm" role="alert">
      <span className="delete-confirm-text">
        {small ? 'Delete this record?' : `Delete ${patientName}'s record? This cannot be undone.`}
      </span>
      <span className="delete-confirm-actions">
        <button
          type="button"
          className={`button button-secondary ${size}`}
          onClick={() => setConfirming(false)}
          disabled={deleting}
        >
          Cancel
        </button>
        <button type="button" className={`button button-danger-solid ${size}`} onClick={handleConfirm} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Yes, delete'}
        </button>
      </span>
    </span>
  )
}

export default DeleteButton
