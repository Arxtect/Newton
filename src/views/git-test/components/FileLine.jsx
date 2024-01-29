import React from 'react';
import { Icon } from "@blueprintjs/core"
import fs from "fs"
import range from "lodash/range"
import path from "path"
import pify from "pify"
import {
    ContextMenu,
    ContextMenuProvider,
    Item,
    Separator
} from "react-contexify"

import Draggable from "./Draggable"; // Adjust the import path as needed
import Input from "./Input"; // Adjust the import path as needed
import Pathname from "./Pathname"; // Adjust the import path as needed

const Container = ({ selected, children }) => {
    // Define the base classes for the component
    const baseClasses = "cursor-pointer user-select-none pl-1";

    // Define the dynamic classes based on the `selected` prop
    const hoverClasses = selected
        ? "hover:bg-black hover:text-red-600"
        : "hover:bg-black hover:text-white";

    return (
        <div className={`${baseClasses} ${hoverClasses}`}>
            {children}
        </div>
    );
};


const FileLine = ({
    depth,
    filepath,
    editingFilepath,
    renamingPathname,
    isMobile,
    loadFile,
    fileMoved,
    endRenaming,
    pushScene,
    ignoreGit // Assuming this is also a prop that needs to be passed down
}) => {
    const basename = path.basename(filepath);

    const handleRenameConfirm = async (value) => {
        const dirname = path.dirname(filepath);
        const destPath = path.join(dirname, value);
        await pify(fs.rename)(filepath, destPath);
        endRenaming();
        fileMoved({ fromPath: filepath, destPath });
    };

    if (renamingPathname === filepath) {
        return (
            <div>
                <Input
                    focus
                    initialValue={basename}
                    onCancel={() => endRenaming()}
                    onConfirm={handleRenameConfirm}
                />
            </div>
        );
    }

    return (
        <ContextMenuProvider id="file" data={{ filepath }}>
            <Draggable
                pathname={filepath}
                type="file"
                onDrop={async (result) => {
                    if (result) {
                        fileMoved(result);
                    }
                }}
                onDropByOther={() => {
                    // Do nothing yet
                }}
            >
                <Container selected={editingFilepath === filepath}>
                    <div
                        onClick={() => {
                            loadFile({ filepath });
                            if (isMobile) {
                                pushScene({ nextScene: "edit" });
                            }
                        }}
                        className="flex items-center space-x-2 cursor-pointer" // Tailwind classes for styling
                    >
                        {/* {range(depth).map((_, k) => (
                            <span key={k} className="w-4 inline-block"></span> // Tailwind classes for spacing
                        ))} */}
                        <Icon icon="document" />
                        <Pathname ignoreGit={ignoreGit}>{basename}</Pathname>
                    </div>
                </Container>
            </Draggable>
        </ContextMenuProvider>
    );
};

const FileContextMenu = ({
    root,
    addToStage,
    deleteFile,
    startRenaming
    // include other props as necessary
}) => {
    const handleRename = (dataFromProvider) => {
        startRenaming({ pathname: dataFromProvider.filepath });
    };

    const handleDelete = (dataFromProvider) => {
        deleteFile({ filename: dataFromProvider.filepath });
    };

    const handleAddToStage = (dataFromProvider) => {
        const relpath = path.relative(root, dataFromProvider.filepath);
        addToStage({ projectRoot: root, relpath });
    };

    return (
        <ContextMenu id="file">
            <Item onClick={handleRename}>Rename</Item>
            <Item onClick={handleDelete}>Delete</Item>
            <Separator />
            <Item onClick={handleAddToStage}>Add to stage</Item>
        </ContextMenu>
    );
};

export default FileLine;
