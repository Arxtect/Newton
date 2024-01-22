import React, { useState } from 'react';
import Editor from "./editor"
import Social from "./social"
import Publishing from "./publishing"

const TabButton = ({ children, selected, onClick }) => (
    <button
        className={`flex-1 px-4 py-2 text-lg font-lg text-center ${selected ? 'bg-gray-300 text-black' : 'bg-gray-200 text-gray-700'
            } focus:outline-none`}
        onClick={onClick}
    >
        {children}
    </button>
);

const TabContent = ({ children, isOpen }) => {
    if (!isOpen) return null;
    return <div className="w-full p-4 border-t-2">{children}</div>;
};

const Products = () => {
    const [selectedTab, setSelectedTab] = useState(0);

    return (
        <div className="w-full">
            <div className="flex divide-x divide-gray-300">
                <TabButton selected={selectedTab === 0} onClick={() => setSelectedTab(0)}>
                    Editor (Newton)
                </TabButton>
                <TabButton selected={selectedTab === 1} onClick={() => setSelectedTab(1)}>
                    Publishing & Reading Ecosystem  (Einstein)
                </TabButton>
                <TabButton selected={selectedTab === 2} onClick={() => setSelectedTab(2)}>
                    Social Network (Maxwell)
                </TabButton>
            </div>
            <div className="w-full mt-8">
                <TabContent isOpen={selectedTab === 0}> <Editor /></TabContent>
                <TabContent isOpen={selectedTab === 1}><Publishing /></TabContent>
                <TabContent isOpen={selectedTab === 2}><Social /></TabContent>
            </div>
        </div>
    );
};

export default Products;
