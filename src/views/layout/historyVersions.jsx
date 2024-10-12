import {
    IconButton,
    Menu,
    MenuItem,
    Box,
    DialogTitle,
    DialogContent,
} from '@mui/material';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getHistoryWithChanges, getDiff } from "domain/git";
import { useGitRepo, useFileStore } from "store";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { downloadSpecificVersion } from "domain/filesystem";
// import { gitCheckout } from '../../domain/filesystem/commands/gitCheckout';

const HistoryVersions = () => {
    const [historyVersions, setHistoryVersions] = useState([]);
    const [currentDiff, setCurrentDiff] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [menuState, setMenuState] = useState({
        anchorEl: null,
        openMenuIndex: null,
    });
    const menuClickedRef = useRef(false);

    const { projectRoot } = useFileStore((state) => ({
        projectRoot: state.currentProjectRoot,
    }));
    const { currentBranch, moveToBranch } = useGitRepo((state) => ({
        currentBranch: state.currentBranch,
        moveToBranch: state.moveToBranch,
    }));

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
    const handleMenuClick = useCallback((event, index) => {
        event.stopPropagation();
        menuClickedRef.current = true;
        setMenuState({
            anchorEl: event.currentTarget,
            openMenuIndex: index,
        });
    }, []);
    const handleMenuClose = useCallback(() => {
        menuClickedRef.current = true;
        setMenuState({
            anchorEl: null,
            openMenuIndex: null,
        });
    }, []);
    const handleSelectBox = useCallback((index, event) => {
        if (!menuClickedRef.current) {
            setSelectedIndex(index);
        }
        menuClickedRef.current = false;
    }, []);
    const handleDownloadSpecificVersion = () => {
        handleMenuClose();
        downloadSpecificVersion(projectRoot, historyVersions[selectedIndex]?.commitOid);
    };
    const handleCheckout = () => {
        moveToBranch(projectRoot, historyVersions[selectedIndex]?.commitOid);
    };
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
                </div>
                <div aria-label='file-info' style={{ flex: 1, textAlign: 'right' }} title={`${currentDiff.filter((d) => d.added || d.removed).length} changes in ${historyVersions[selectedIndex]?.fileWithChange[0]?.path}`}>
                    changes
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
                            onClick={(event) => handleSelectBox(index, event)}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '8px',
                                right: '16px',
                            }}>
                                <IconButton
                                    aria-label="more"
                                    id={`history-button-${index}`}
                                    aria-controls={`history-menu-${index}`}
                                    aria-haspopup="true"
                                    aria-expanded={menuState.openMenuIndex === index}
                                    onClick={(event) => handleMenuClick(event, index)}
                                    sx={{ padding: '4px' }}
                                >
                                    <MoreVertIcon sx={{ fontWeight: 'bold', color: 'black' }} />
                                </IconButton>
                                <Menu
                                    id={`history-menu-${index}`}
                                    anchorEl={menuState.anchorEl}
                                    keepMounted
                                    open={menuState.openMenuIndex === index}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem onClick={handleMenuClose}>Display diffLines</MenuItem>
                                    <MenuItem onClick={handleDownloadSpecificVersion}>Download this version</MenuItem>
                                    <MenuItem onClick={handleCheckout}>Checkout to this version</MenuItem>
                                </Menu>
                            </div>
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
                            {/* <p>{version.commitOid}</p>
                            <p>{version.commitParent}</p> */}
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