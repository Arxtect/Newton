import React from 'react';

const AITools = () => {
  return (
    <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
            <div className="text-lg font-semibold">Arxtect</div>
            <div className="flex items-center space-x-2">
                <button className="text-gray-500"><i className="fas fa-cog"></i></button>
            </div>
        </div>
        <div className="flex-grow overflow-y-auto p-4">
            <div className="mb-4">
                <div className="flex items-center space-x-2">
                    <div className="text-2xl">👋</div>
                    <div className="text-2xl font-semibold">Hi~ 我是CodeGeeX</div>
                </div>
                <p className="mt-2 text-gray-700">
                    我一直在这里，随时帮助你高效地完成工作，你可以通过 <a href="#" className="text-blue-500">用户手册</a> 了解更多关于我的信息，或是 <a href="#" className="text-blue-500">提交反馈</a> 让我变得更好，我支持 <a href="#" className="text-blue-500">解释代码</a>、<a href="#" className="text-blue-500">生成注释</a>、<a href="#" className="text-blue-500">联网搜索</a>、<a href="#" className="text-blue-500">文件提问</a> 等功能，快来试试吧。
                </p>
            </div>
            <div className="mb-4">
                <img src="https://placehold.co/600x100" alt="广告横幅" className="w-full" />
            </div>
            <div className="mb-4">
                <button className="bg-blue-500 text-white px-4 py-2 rounded">功能向导</button>
            </div>
            <div className="border p-4 rounded">
                <div className="mb-2">
                    <span className="text-gray-700">你可以试试这么问:</span>
                    <button className="ml-2 text-gray-500"><i className="fas fa-sync-alt"></i> 换一换</button>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <i className="fas fa-database text-gray-500"></i>
                        <span>@repo langchain-ai/langchain 列出和memory相关的chain</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <i className="fas fa-book text-gray-500"></i>
                        <span>查询常用Git仓库进行回归，解答方法底层原理</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <i className="fas fa-keyboard text-gray-500"></i>
                        <span>我在设计图书管理的数据库，帮我设计表名和字段名</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <i className="fas fa-desktop text-gray-500"></i>
                        <span>不小心删除了Mac上的文件怎么办?</span>
                    </div>
                </div>
            </div>
        </div>
        <div className="px-4 border-t flex items-center space-x-2">
            <div className="relative flex-grow">
                <textarea 
                    placeholder="输入 '@' 调用快捷命令，'@' 引用代码文件或知识库" 
                    className="w-full border rounded px-4 py-2 min-h-[4rem] pr-10"
                ></textarea>
                <div className="absolute right-2 bottom-2 flex space-x-2">
                    <button className="text-gray-500"><i className="fas fa-paperclip"></i></button>
                    <button className="text-gray-500"><i className="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    </div>
);
}

export default AITools;