import {
    IconButton,
    Menu,
    MenuItem,
    Box,
    DialogTitle,
    DialogContent,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { getHistoryWithChanges, getDiff } from "domain/git";
import { useGitRepo, useFileStore } from "store";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { downloadSpecificVersion } from "domain/filesystem";

const HistoryVersions = () => {
    const { projectRoot } = useFileStore((state) => ({
        projectRoot: state.currentProjectRoot,
    }));
    const { currentBranch } = useGitRepo((state) => ({
        currentBranch: state.currentBranch,
    }));
    const [historyVersions, setHistoryVersions] = useState([])
    const [currentDiff, setCurrentDiff] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    useEffect(() => {
        const fetchHistory = async () => {
            const changeHistory = await getHistoryWithChanges(
                projectRoot,
                currentBranch,
            );
            setHistoryVersions(changeHistory);
            console.log(changeHistory, "changeHistory");
        };

        fetchHistory()
            .then(() => { })
            .catch((e) => console.error(e));
    }, [projectRoot, currentBranch]);

    useEffect(() => {
        if (historyVersions) {
            const filepath = historyVersions[selectedIndex]?.fileWithChange[0]?.path;
            const parentOid = historyVersions[selectedIndex]?.commitParent;
            const currentOid = historyVersions[selectedIndex]?.commitOid;
            if (filepath && parentOid && currentOid) {
                const fetchDiff = async () => {
                    const diff = await getDiff(projectRoot, parentOid, currentOid, filepath);
                    setCurrentDiff(diff);
                };

                fetchDiff()
                    .then(() => { })
                    .catch((e) => console.error(e));
            }
        }
    }, [projectRoot, historyVersions, selectedIndex]);

    const formatDate = (timestamp) => {
        console.log(timestamp, "timestamp");
        const formattedDate = new Date(timestamp).toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        console.log(formattedDate, "formattedDate");
        const parts = formattedDate.split(' ');
        console.log(parts, "parts");
        console.log(parts[4], "part[4]");
        parts[4] = parts[4].toLowerCase();

        const dateWithSuffix = parts[1] + 'th ' + parts[0] + ' · ' + parts[3] + ' ' + parts[4];

        console.log(dateWithSuffix);
        return dateWithSuffix;
    };

    // Menu state
    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    const handleSelect = (index) => {
        setSelectedIndex(index);
    }
    console.log(historyVersions, "historyVersions");
    // 渲染逻辑
    return (
        <React.Fragment>
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 16px',
                gap: '8px',
                fontSize: '14px',
            }}>
                <div aria-label='datetime' title={`Viewing ${historyVersions.length > 0 ? formatDate(historyVersions[selectedIndex]?.timestamp * 1000) : ''}`}>
                    datetime
                    {/* Viewing&nbsp;
                    {historyVersions.length > 0 && formatDate(historyVersions[selectedIndex]?.timestamp * 1000)} */}
                </div>
                <div aria-label='file-info' style={{ flex: 1, textAlign: 'right' }} title={`${currentDiff.filter((d) => d.added || d.removed).length} changes in ${historyVersions[selectedIndex]?.fileWithChange[0]?.path}`}>
                    changes
                    {/* {currentDiff.filter((d) => d.added || d.removed).length}
                    &nbsp;changes in&nbsp;
                    {historyVersions[selectedIndex]?.fileWithChange[0]?.path} */}
                </div>
            </DialogTitle>
            <DialogContent sx={{ padding: 0, fontSize: '14px', }}>
                {historyVersions.length > 0 ? (
                    historyVersions.map((version, index) => (
                        <Box
                            key={index}
                            sx={{
                                position: 'relative',
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
                            <IconButton
                                aria-label="more"
                                id={`history-button-${index}`}
                                aria-controls={`history-menu-${index}`}
                                aria-haspopup="true"
                                aria-hidden="true"
                                aria-expanded={Boolean(anchorEl)}
                                onClick={handleMenuClick}
                                sx={{ position: 'absolute', top: 0, right: 0 }}
                            >
                                <MoreVertIcon sx={{ fontWeight: 'bold', color: 'black' }} />
                            </IconButton>
                            <Menu
                                id={`history-menu-${index}`}
                                anchorEl={anchorEl}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                            >
                                <MenuItem onClick={handleMenuClose}>Display diffLines</MenuItem>
                                <MenuItem onClick={() => { handleMenuClose(); console.log(projectRoot, version.commitOid); downloadSpecificVersion(projectRoot, version.commitOid) }}>Download this version</MenuItem>
                            </Menu>
                            <div style={{ fontWeight: 'bold' }}>{formatDate(version?.timestamp * 1000)}</div>
                            <ul>
                                {version.fileWithChange.map((change, changeIndex) => (
                                    <li key={changeIndex}>
                                        <div>{change.type}</div>
                                        <div>{change.path}</div>
                                    </li>
                                ))}
                            </ul>
                            <p>{version.committerName}</p>
                            <p>{version.commitOid}</p>
                            <p>{version.commitParent}</p>
                            {selectedIndex === index &&
                                <pre className="overflow-auto p-2 mt-2 border-black bg-white">
                                    <p className='mb-2 font-bold'>{version.fileWithChange[0]?.path}: </p>
                                    {currentDiff
                                        .filter((d) => d.added || d.removed)
                                        .map((d) =>
                                            d.added
                                                ? `+ : ${d.value}`
                                                : d.removed
                                                    ? `- : ${d.value}`
                                                    : d.value).join("\n")
                                    }
                                </pre>
                            }
                        </Box>
                    ))
                ) : (
                    <p>No history versions available.</p>
                )}
            </DialogContent>
        </React.Fragment>
    );
}

export default HistoryVersions;