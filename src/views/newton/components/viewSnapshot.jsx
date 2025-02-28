import { Tooltip, Dialog } from "@mui/material"
import React, { useState, useRef, useEffect } from "react"
import historyIcon from "@/assets/history.svg"
import { X } from "react-feather"
import { SnapshotDialog } from './fileSystem/components/SnapshotDialog'
import { v4 as uuidv4 } from 'uuid';
import { formatDistanceToNow } from 'date-fns';
const ViewSnapshot = ({ currentProject, saveSnapshot, loadSnapshot, deleteSnapshot, getSnapshotInfo }) => {
  const [showHistory, setShowHistory] = useState(false)
  const [snapshots, setSnapshots] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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

  const restoreSnapshot = async (snapshot) => {
    loadSnapshot(snapshot.id)
  }
  const funcDeleteSnapshot = async (snapshotId) => {
    deleteSnapshot(snapshotId)
    setSnapshots(snapshots.filter((snapshot) => snapshot.id !== snapshotId))
  }

  // 打开历史记录对话框
  const handleOpenHistory = () => {
    setShowHistory(true)
  }

  // 关闭历史记录对话框
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
      {/* Tooltip 和按钮 */}
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

      {/* Dialog 弹窗，显示历史快照 */}
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
                    <button
                      className="snapshot-item__delete text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-200 transition-colors"
                      onClick={() => funcDeleteSnapshot(snapshot.id)}
                    >
                      <X className="snapshot-item__icon w-4 h-4" />
                    </button>
                  </div>
                  <div
                    className="snapshot-item__time"
                    style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {formatDistanceToNow(snapshot.creationTime, { addSuffix: true })}
                  </div>

                  <button
                    className="snapshot-item__restore w-full mt-2 text-sm py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded border border-green-200 transition-colors"
                    onClick={() => restoreSnapshot(snapshot)}
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

          <SnapshotDialog
            open={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onSave={funcSaveSnapshot}
          />
        </div>
      </Dialog>
    </React.Fragment>
  )
}

export default ViewSnapshot
