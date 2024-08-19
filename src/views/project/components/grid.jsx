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

  return (
    <div>
      <div className="grid grid-cols-6 gap-5 items-start text-base leading-4 text-center text-black max-md:grid-cols-1 max-md:mt-10 max-md:max-w-full">
        {[...sortedRows].map((item) => {
          const pdfUrl = pdfUrls[item.id];
          return (
            <div
              onClick={async (e) => {
                const isAuth = auth(
                  item.name !== "YOU" &&
                    (!user || JSON.stringify(user) === "{}"),
                  () => {
                    e.stopPropagation();
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
              }}
              className="flex flex-col flex-1 mt-1.5 cursor-pointer relative"
              key={item.id}
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
              </div>
              <div className="self-center mt-3 hover:text-[#81c784] hover:underline">
                {item.title}
              </div>
              <div className="action absolute top-[50%] transform -translate-y-[50%]">
                <Action
                  item={item}
                  auth={auth}
                  getProjectList={getProjectList}
                  handleGithub={handleGithub}
                ></Action>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Grid;
