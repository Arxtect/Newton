import React, { useState, useEffect } from 'react';
import { Button } from "./Button";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import { loadFileNames, initDB } from '../util.js'

const FileUpload = () => {
    const [files, setFiles] = useState([]);
    const [open, setOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // 处理文件上传
    const handleUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const db = await initDB();
        const tx = db.transaction('files', 'readwrite');
        await tx.store.put({ name: file.name, content: file });
        await tx.done;
        setSnackbarMessage(`上传成功：${file.name}`);
        setSnackbarOpen(true);
        loadFileNamesList()
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };
    // 组件挂载时加载文件名称列表
    useEffect(() => {
        loadFileNamesList()
    }, []);

    const loadFileNamesList = async () => {
        let files = await loadFileNames()
        setFiles(files);
    }

    const deleteFile = async (fileName) => {
        const db = await initDB();
        const tx = db.transaction('files', 'readwrite');
        await tx.store.delete(fileName);
        await tx.done;
        loadFileNamesList()
    };


    return (
        <div className='flex'>
            <div className='mr-2'>
                <input
                    accept="image/*"
                    type="file"
                    onChange={handleUpload}
                    style={{ display: 'none' }}
                    id="upload-button"
                />
                <label htmlFor="upload-button">
                    <Button component="span">
                        上传文件
                    </Button>
                </label>

            </div>
            {files.length > 0 && (
                <Button onClick={() => setOpen(true)}>
                    文件列表
                </Button>
            )}
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 bg-white shadow-xl p-4">
                    <h2 id="modal-modal-title" className="mb-4">文件列表</h2>
                    <div className="overflow-auto  max-h-[50vh]">
                        <ul id="modal-modal-description">
                            {files.map((fileName, index) => (
                                <li key={index} className="flex justify-between items-center mb-2">
                                    <span>
                                        {index + 1}、{fileName}
                                    </span>
                                    <Button className="ml-2 h-7" onClick={() => deleteFile(fileName)}>
                                        删除
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Box>
            </Modal>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={handleCloseSnackbar}
                message={snackbarMessage}
                ContentProps={{
                    sx: {
                        bgcolor: 'white', // 设置背景色为白色
                        color: 'black' // 设置文字颜色为黑色
                    }
                }}
            />
        </div>
    );
};

export default FileUpload;
