/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-07-30 15:02:25
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PdfImageLocal from "@/components/pdfImageLocal";
import { useFileStore } from "store";
import Action from "./action";

const Grid = ({
  sortedRows,
  auth,
  user,
  changeCurrentProjectRoot,
  getProjectList,
  handleGithub,
  handleCopy,
  handleRename,
  controlShare,
  handleDeleteProject,
  setIsGitDelete,
  setIsTrashDelete,
}) => {
  const { getCurrentProjectPdf } = useFileStore((state) => ({
    getCurrentProjectPdf: state.getCurrentProjectPdf,
  }));
  const navigate = useNavigate();

  const [pdfUrls, setPdfUrls] = useState({});

  useEffect(() => {
    const fetchPdfUrls = async () => {
      const urls = {};
      for (const item of sortedRows) {
        const url = await getCurrentProjectPdf(item.title);
        urls[item.id] = url;
      }
      setPdfUrls(urls);
      console.log(urls, "urls");
    };

    fetchPdfUrls();
  }, [sortedRows]);

  const handleItemClick = (item, e) => {
    e.stopPropagation();
    const isAuth = auth(
      item.name !== "YOU" && (!user || JSON.stringify(user) === "{}"),
      () => {
        changeCurrentProjectRoot({
          projectRoot: item.title,
        });
        navigate("/newton");
      }
    );
    if (isAuth) return;
    e.stopPropagation();
    changeCurrentProjectRoot({
      projectRoot: item.title,
    });
    navigate("/newton");
  };

  return (
    <div>
      <div className="grid grid-cols-6 gap-5 items-start text-base leading-4 text-center text-black max-md:grid-cols-1 max-md:mt-10 max-md:max-w-full">
        {[...sortedRows].map((item) => {
          const pdfUrl = pdfUrls[item.id];
          return (
            <div
              key={item.id}
              className="flex flex-col flex-1 mt-1.5 cursor-pointer relative"
              onMouseEnter={(e) => {
                e.currentTarget.querySelector(".action").style.visibility =
                  "visible";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.querySelector(".action").style.visibility =
                  "hidden";
              }}
            >
              <div className="relative">
                <PdfImageLocal url={pdfUrl} height={178} />
                <div className="absolute inset-0 bg-gradient-to-b from-[#afccb7] to-[#7da97fd1] opacity-50"></div>
                <div className="action absolute top-[50%] transform -translate-y-[50%] w-full">
                  <Action
                    item={item}
                    auth={auth}
                    getProjectList={getProjectList}
                    handleGithub={handleGithub}
                    user={user}
                    handleCopy={handleCopy}
                    handleRename={handleRename}
                    controlShare={controlShare}
                    handleDeleteProject={handleDeleteProject}
                    setIsGitDelete={setIsGitDelete}
                    setIsTrashDelete={setIsTrashDelete}
                  ></Action>
                </div>
              </div>
              <div
                className="self-center mt-3 hover:text-[#81c784] hover:underline"
                onClick={(e) => handleItemClick(item, e)}
              >
                {item.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Grid;
