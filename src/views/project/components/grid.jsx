import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Grid = ({ sortedRows, auth, user, changeCurrentProjectRoot }) => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="grid grid-cols-6 gap-5 items-start text-base leading-4 text-center text-black max-md:grid-cols-1 max-md:mt-10 max-md:max-w-full">
        {[...sortedRows].map((item) => {
          return (
            <div
              className="flex flex-col flex-1 mt-1.5 cursor-pointer"
              key={item.id}
              onClick={async (e) => {
                const isAuth = auth(
                  item.name != "YOU" &&
                    (!user || JSON.stringify(user) === "{}"),
                  () => {
                    e.stopPropagation();
                    changeCurrentProjectRoot({
                      projectRoot: item.title,
                    });
                    navigate(`/newton`);
                  }
                );
                if (isAuth) return;
                e.stopPropagation();
                changeCurrentProjectRoot({
                  projectRoot: item.title,
                });
                navigate(`/newton`);
              }}
            >
              <div className="shrink-0 bg-zinc-300 h-[178px]" />
              <div className="self-center mt-3 hover:text-[#81c784] hover:underline">
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
