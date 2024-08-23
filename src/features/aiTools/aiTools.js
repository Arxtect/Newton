/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-08-23 18:28:04
 */
import React from "react";

function AiTools() {
  return (
    <div className="p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">CODEGEEX</h1>
          <div className="flex items-center space-x-2">
            <button className="text-gray-500 hover:text-gray-700">
              <i className="fas fa-cog"></i>
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <i className="fas fa-question-circle"></i>
            </button>
          </div>
        </div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">
            Hi~ 我是CodeGeeX <span className="wave">👋</span>
          </h2>
          <p className="text-gray-700">
            我一直在这里，随时帮助你更高效地完成工作，你可以通过{" "}
            <a href="#" className="text-blue-500">
              用户手册
            </a>{" "}
            了解更多关于我的信息，或是{" "}
            <a href="#" className="text-blue-500">
              提交反馈
            </a>{" "}
            让我变得更好，我支持{" "}
            <a href="#" className="text-blue-500">
              解释代码
            </a>
            、
            <a href="#" className="text-blue-500">
              生成注释
            </a>
            、
            <a href="#" className="text-blue-500">
              联网搜索
            </a>
            、
            <a href="#" className="text-blue-500">
              文件提问
            </a>{" "}
            等功能，快来试试吧。
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-bold mb-2">功能向导</h3>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-700 mb-2">你可以试试这么问：</p>
            <ul className="list-disc list-inside space-y-2">
              <li className="text-blue-500">
                @recentFiles 哪里可以加更多错误判断以提高稳定性
              </li>
              <li className="text-blue-500">
                引用项目文件进行提问，让回答更符合需求
              </li>
              <li className="text-blue-500">LSTM在RNN的基础上做了哪些改进</li>
              <li className="text-blue-500">
                Commit message的标准语法格式是什么
              </li>
            </ul>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="输入 '/' 调用快捷命令，@ 引用代码文件或知识库"
            className="flex-grow p-2 border rounded-lg"
          />
          <button className="text-gray-500 hover:text-gray-700">
            <i className="fas fa-paperclip"></i>
          </button>
          <button className="text-gray-500 hover:text-gray-700">
            <i className="fas fa-smile"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AiTools;