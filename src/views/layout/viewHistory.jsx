// ViewHistory.js
import {
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Box,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import historyIcon from '@/assets/history.svg';
import format from 'date-fns/format';
import { useGitRepo, useFileStore } from "store";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getFileHistoryWithDiff } from "domain/git";
// import { getFileStateChanges } from "domain/git";
import HistoryVersions from './historyVersions';
import path from "path";

const ViewHistory = () => {
    const [showHistory, setShowHistory] = useState(false);

    const handleOpenHistory = () => {
        setShowHistory(true);
    };

    const handleCloseHistory = () => {
        setShowHistory(false);
    };

    const dialogStyle = {
        position: 'fixed',
        width: '430px',
        height: '648px',
        maxWidth: '660px',
        maxHeight: '648px',
        top: '51px',
        right: '-36px',
        transform: 'translate(0, 0)',
    };

    return (
        <React.Fragment>
            <Tooltip title="View History">
                <button
                    className={`flex items-center text-gray-700 px-2 py-1 hover:bg-gray-200 ${showHistory ? 'bg-[#9fd5a2]' : ''} space-x-1 `}
                    onClick={() => {
                        handleOpenHistory();
                    }}
                >
                    <img src={historyIcon} alt="" className="w-4 h-4" />
                    <span>History</span> {/* 使用空格字符 */}
                </button>
            </Tooltip>
            <Dialog
                open={showHistory}
                onClose={handleCloseHistory}
                PaperProps={{ sx: dialogStyle }}
                BackdropProps={{ sx: { backgroundColor: 'transparent' } }}>
                <HistoryVersions />
            </Dialog>
        </React.Fragment>
    );
};

export default ViewHistory;