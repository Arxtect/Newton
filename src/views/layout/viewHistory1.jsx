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
import { getFileStateChanges } from "domain/git";
import path from "path";

const ViewHistory = () => {
    const { projectRoot, filepath, saveFile } = useFileStore((state) => ({
        projectRoot: state.currentProjectRoot,
        filepath: state.filepath,
        saveFile: state.saveFile,
    }));
    const { currentBranch, history } = useGitRepo((state) => ({
        currentBranch: state.currentBranch,
        history: state.history,
    }));
    console.log(history, "history");
    // const [historyVersions, setHistoryVersions] = useState([]);
    async function fetchHistory(history) {
        const fetchedHistoryVersions = await Promise.all(
            history.map(async (commit) => {
                const parentHash = commit.commit.parent[0];
                try {
                    const changes = await getFileStateChanges(parentHash, commit.oid, projectRoot);
                    const fileWithChange = changes.filter((change) => change.type !== 'equal');
                    console.log(fileWithChange, "fileWithChange");
                    return {
                        fileWithChange,
                        timestamp: commit.commit.committer?.timestamp,
                        committerName: commit.commit.committer?.name,
                    };
                } catch (e) {
                    return null;
                }
            })
        );
        const validHistoryVersions = fetchedHistoryVersions.filter(version => version !== null);
        return validHistoryVersions;
    }
    let historyVersions = fetchHistory(history);
    const [currentHistory, setCurrentHistory] = useState([]);

    // useEffect(() => {
    //     const fetchHistory = async () => {
    //         if (!filepath) return;

    //         const relpath = path.relative(projectRoot, filepath);
    //         const changeHistory = await getFileHistoryWithDiff(
    //             projectRoot,
    //             currentBranch,
    //             relpath
    //         );
    //         console.log(changeHistory, "changeHistory");
    //         const formattedHistory = changeHistory
    //             .map((c) => ({
    //                 message: c.commit.commit.message,
    //                 commitId: c.commit.oid,
    //                 timestamp: c.commit.commit.committer?.timestamp,
    //                 name: c.commit.commit.committer?.name,
    //                 content: Buffer.from(c.blob).toString('utf8'), // 确保正确解码
    //                 diffCount: c.diff.filter((d) => d.added || d.removed).length,
    //                 diffText: c.diff
    //                     .filter((d) => d.added || d.removed)
    //                     .map((d) =>
    //                         d.added
    //                             ? `+ : ${d.value}`
    //                             : d.removed
    //                                 ? `- : ${d.value}`
    //                                 : d.value
    //                     )
    //                     .join("\n"),
    //             }))
    //             .reverse();

    //         setCurrentHistory(formattedHistory);
    //     };

    //     fetchHistory()
    //         .then(() => { })
    //         .catch((e) => console.error(e));

    // }, [filepath, projectRoot, currentBranch]);

    const [versionLatestTime, setVersionLatestTime] = useState(null);

    const getLatestTime = (history) => {
        if (history.length === 0) {
            return null;
        }

        const latestTime = history.reduce((acc, cur) => {
            const currentTimestamp = cur.timestamp * 1000;
            const accTimestamp = new Date(acc).getTime();

            if (!isNaN(currentTimestamp) && currentTimestamp > accTimestamp) {
                return currentTimestamp;
            }
            return accTimestamp;
        }, new Date(history[0].timestamp * 1000));

        const dateFormatter = new Intl.DateTimeFormat('en-US', {
            day: 'numeric',
            month: 'long',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        });
        // console.log(dateFormatter, "dateFormatter");
        const formattedLatestTime = dateFormatter.format(latestTime);
        // .replace(',', '') // 移除逗号
        // .replace(/(\d)(?=st|nd|rd|th$)/g, '$1') // 移除序数词前的数字末尾的空格
        // .replace(/st|nd|rd|th/g, match => match + ' ') // 添加空格
        // .replace(/\s/g, '') // 移除所有空格
        // .replace('.', '') // 移除句点
        // .replace('·', ' '); // 替换为英文句号

        // 添加"·"分隔符
        // const finalFormattedTime = `${formattedLatestTime.split(' ').slice(0, -3).join(' ')} · ${formattedLatestTime.split(' ').slice(-2).join(':')}`;

        // const formattedLatestTime = format(new Date(latestTime), "MM/dd HH:mm");
        // return finalFormattedTime;
        return formattedLatestTime;
    };

    useEffect(() => {
        setVersionLatestTime(getLatestTime(currentHistory));
    }, [currentHistory]);
    console.log(currentHistory, "currentHistory");

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

    // Menu state
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    const handleSelect = (index) => {
        setSelectedIndex(index);
    }

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
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 16px',
                }}>
                    <Box sx={{ flex: 1, textAlign: 'left', fontSize: '0.75rem' }}>
                        Viewing {versionLatestTime}
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'right', fontSize: '0.75rem' }}>
                        x changes in {path.relative(projectRoot, filepath)}
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ padding: 0 }}>
                    <historyVersions />
                    {historyVersions.length > 0 ? (
                        historyVersions.map((description, index) => (
                            <Box
                                key={index}
                                sx={{
                                    position: 'relative',
                                    fontSize: '0.75rem',
                                    padding: '8px 16px',
                                    ...(selectedIndex === index && {
                                        backgroundColor: '#eaf6ef',
                                        borderLeft: '3px solid #098842',
                                        paddingLeft: '13px',
                                    }),
                                    '&:hover': {
                                        backgroundColor: (selectedIndex === index ? '#eaf6ef' : '#f0f0f0'),
                                    },
                                }}
                                onClick={() => handleSelect(index)}
                            >
                                <div>
                                    <IconButton
                                        aria-label="more"
                                        id={`history-button-${index}`}
                                        aria-controls={`history-menu-${index}`}
                                        aria-haspopup="true"
                                        aria-expanded={Boolean(anchorEl)}
                                        onClick={handleMenuClick}
                                        sx={{ position: 'absolute', top: 0, right: 0, fontSize: '0.75rem' }}
                                    >
                                        <MoreVertIcon sx={{ fontSize: 'inherit', fontWeight: 'bold', color: 'black' }} />
                                    </IconButton>
                                    <Menu
                                        id={`history-menu-${index}`}
                                        anchorEl={anchorEl}
                                        keepMounted
                                        open={Boolean(anchorEl)}
                                        onClose={handleMenuClose}
                                    >
                                        <MenuItem onClick={handleMenuClose}>Label this version</MenuItem>
                                        <MenuItem onClick={handleMenuClose}>Download this version</MenuItem>
                                    </Menu>
                                    <div style={{ marginBottom: '0.25rem', fontWeight: 'bold' }}>
                                        {new Date(description.timestamp * 1000).toLocaleString()}
                                    </div>
                                    <div>
                                        {description.fileWithChange.type}
                                    </div>
                                    <div>
                                        {description.fileWithChange.path}
                                    </div>
                                    <div>
                                        {description.committerName}
                                    </div>
                                </div>
                            </Box>
                        ))) : (
                        <p>No history versions available.</p>
                    )}
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
};

export default ViewHistory;