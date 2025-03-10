import { useState } from "react"

export function SnapshotDialog({ open, onClose, onSave }) {
  const [snapshotName, setSnapshotName] = useState("")

  const handleSave = () => {
    if (!snapshotName.trim()) return
    onSave(snapshotName)
    setSnapshotName("")
    onClose()
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-96">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Save Snapshot</h2>
          <p className="text-gray-600 mb-4">
            Create a named snapshot of the current file state.
          </p>
          <input
            value={snapshotName}
            onChange={(e) => setSnapshotName(e.target.value)}
            placeholder="Enter snapshot name"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 mb-4"
          />
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded-md font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-md font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={!snapshotName.trim()}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
