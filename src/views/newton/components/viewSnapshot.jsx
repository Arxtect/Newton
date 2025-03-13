"use client"

import { Tooltip, Dialog } from "@mui/material"
import React, { useState, useEffect } from "react"
import historyIcon from "@/assets/history.svg"
import { X, Edit2 } from "react-feather"
import { SnapshotDialog } from "./fileSystem/components/SnapshotDialog"
import { v4 as uuidv4 } from "uuid"
import { formatDistanceToNow } from "date-fns"

const ViewSnapshot = ({
  currentProject,
  saveSnapshot,
  loadSnapshot,
  deleteSnapshot,
  getSnapshotInfo,
  renameSnapshot,
}) => {
  const [showHistory, setShowHistory] = useState(false)
  const [snapshots, setSnapshots] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [snapshotToDelete, setSnapshotToDelete] = useState(null)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [snapshotToRename, setSnapshotToRename] = useState(null)
  const [newSnapshotName, setNewSnapshotName] = useState("")
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false)
  const [snapshotToRestore, setSnapshotToRestore] = useState(null)

  useEffect(() => {
    const fetchSnapshots = async () => {
      const snapshots = await getSnapshotInfo();
      setSnapshots(snapshots);
    };
    fetchSnapshots();
  }, []);
  const funcSaveSnapshot = async (snapshotName) => {
    const snapshotId = uuidv4();
    const creationTime = Date.now();
    const newSnapshot = {
      id: snapshotId,
      name: snapshotName,
      creationTime: creationTime,
    }
    saveSnapshot({snapshotName, creationTime, snapshotId})
    setSnapshots([newSnapshot, ...snapshots])
  }

  const funcRenameSnapshot = async (snapshotId, newName) => {
    renameSnapshot(snapshotId, newName)
    setSnapshots(snapshots.map((snapshot) => (snapshot.id === snapshotId ? { ...snapshot, name: newName } : snapshot)))
  }

  const handleRestoreClick = (snapshot) => {
    setSnapshotToRestore(snapshot)
    setIsRestoreDialogOpen(true)
  }

  const confirmRestore = () => {
    if (snapshotToRestore) {
      loadSnapshot(snapshotToRestore.id)
      setIsRestoreDialogOpen(false)
      setSnapshotToRestore(null)
    }
  }

  const handleDeleteClick = (snapshot) => {
    setSnapshotToDelete(snapshot)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (snapshotToDelete) {
      deleteSnapshot(snapshotToDelete.id)
      setSnapshots(snapshots.filter((snapshot) => snapshot.id !== snapshotToDelete.id))
      setIsDeleteDialogOpen(false)
      setSnapshotToDelete(null)
    }
  }

  const handleRenameClick = (snapshot) => {
    setSnapshotToRename(snapshot)
    setNewSnapshotName(snapshot.name)
    setIsRenameDialogOpen(true)
  }

  const confirmRename = () => {
    if (snapshotToRename && newSnapshotName.trim()) {
      funcRenameSnapshot(snapshotToRename.id, newSnapshotName)
      setIsRenameDialogOpen(false)
      setSnapshotToRename(null)
      setNewSnapshotName("")
    }
  }

  const handleOpenHistory = () => {
    setShowHistory(true)
  }

  const handleCloseHistory = () => {
    setShowHistory(false)
  }

  const dialogStyle = {
    position: "fixed",
    width: "430px",
    height: "100%",
    top: "51px",
    right: "-36px",
    transform: "translate(0, 0)",
  }

  return (
    <React.Fragment>
      <Tooltip title="View History">
        <button
          className={`flex items-center text-gray-700 px-2 py-1 hover:bg-gray-200 ${
            showHistory ? "bg-[#9fd5a2]" : ""
          } space-x-1 `}
          onClick={handleOpenHistory}
        >
          <img src={historyIcon || "/placeholder.svg"} alt="" className="w-4 h-4" />
          <span>Snapshot</span>
        </button>
      </Tooltip>

      <Dialog
        open={showHistory}
        onClose={handleCloseHistory}
        PaperProps={{ sx: dialogStyle }}
        slotProps={{
          backdrop: {
            sx: { backgroundColor: "transparent" },
          },
        }}
      >
        <div className="snapshot-panel bg-white h-full shadow-lg flex flex-col">
          <div className="snapshot-panel__content p-4 flex flex-col h-full">
            <div className="snapshot-panel__header flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
              <h3 className="snapshot-panel__title text-lg font-medium text-gray-800">History Snapshots</h3>
              <button
                onClick={() => setIsDialogOpen(true)}
                disabled={!currentProject}
                className="button button--primary bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save Snapshot
              </button>
            </div>

            <div className="snapshot-panel__list flex-1 overflow-y-auto space-y-3">
              {snapshots.map((snapshot) => (
                <div key={snapshot.id} className="snapshot-item bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="snapshot-item__header flex justify-between items-center mb-2">
                    <h4 className="snapshot-item__title font-medium text-gray-700 truncate">{snapshot.name}</h4>
                    <div className="flex items-center space-x-1">
                      <button
                        className="snapshot-item__rename text-gray-500 hover:text-blue-500 p-1 rounded-full hover:bg-gray-200 transition-colors"
                        onClick={() => handleRenameClick(snapshot)}
                      >
                        <Edit2 className="snapshot-item__icon w-4 h-4" />
                      </button>
                      <button
                        className="snapshot-item__delete text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-200 transition-colors"
                        onClick={() => handleDeleteClick(snapshot)}
                      >
                        <X className="snapshot-item__icon w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div
                    className="snapshot-item__time"
                    style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {formatDistanceToNow(snapshot.creationTime, { addSuffix: true })}
                  </div>

                  <button
                    className="snapshot-item__restore w-full mt-2 text-sm py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded border border-green-200 transition-colors"
                    onClick={() => handleRestoreClick(snapshot)}
                  >
                    Restore this version
                  </button>
                </div>
              ))}

              {snapshots.length === 0 && currentProject && (
                <div className="snapshot-panel__empty text-center py-8 text-gray-500 italic">
                  No snapshots for current project
                </div>
              )}

              {!currentProject && (
                <div className="snapshot-panel__empty text-center py-8 text-gray-500 italic">
                  Select a project to view snapshots
                </div>
              )}
            </div>
          </div>

          <SnapshotDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} onSave={funcSaveSnapshot} />

          <Dialog
            open={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            PaperProps={{
              sx: {
                borderRadius: "8px",
                width: "400px",
                padding: "16px",
              },
            }}
          >
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Confirm Delete</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete the snapshot "{snapshotToDelete?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </Dialog>

          <Dialog
            open={isRenameDialogOpen}
            onClose={() => setIsRenameDialogOpen(false)}
            PaperProps={{
              sx: {
                borderRadius: "8px",
                width: "400px",
                padding: "16px",
              },
            }}
          >
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Rename Snapshot</h3>
              <input
                type="text"
                value={newSnapshotName}
                onChange={(e) => setNewSnapshotName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter new name"
              />
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={() => setIsRenameDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  onClick={confirmRename}
                  disabled={!newSnapshotName.trim()}
                >
                  Rename
                </button>
              </div>
            </div>
          </Dialog>
          <Dialog
            open={isRestoreDialogOpen}
            onClose={() => setIsRestoreDialogOpen(false)}
            PaperProps={{
              sx: {
                borderRadius: "8px",
                width: "400px",
                padding: "16px",
              },
            }}
          >
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Confirm Restore</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to restore the snapshot "{snapshotToRestore?.name}"? This will replace your
                current project state.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={() => setIsRestoreDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  onClick={confirmRestore}
                >
                  Restore
                </button>
              </div>
            </div>
          </Dialog>
        </div>
      </Dialog>
    </React.Fragment>
  )
}

export default ViewSnapshot

