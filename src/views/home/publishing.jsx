/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-25 13:51:21
 */

import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/Button";

const Publishing = () => {
  return (
    <div className="bg-white">
      <div className="flex flex-row">
        <div className="flex-1">
          <img src="./assets/Publishing1.png" className="mb-9" />
          <div className="bg-[#EEEEEE] p-4 w-full rounded-lg">
            <ul className="grid grid-cols-2 gap-4 w-full list-disc text-gray-600">
              <li className="flex items-center justify-center w-full p-2">
                <span className="text-black font-semibold">
                  Income redistribution
                </span>
              </li>
              <li className="flex items-center justify-center w-full p-2">
                <span className="text-black font-semibold">
                  Preprint (arXiv)
                </span>
              </li>
              <li className="flex items-center justify-center w-full p-2">
                <span className="text-black font-semibold">
                  Journal as a Service
                </span>
              </li>
              <li className="flex items-center justify-center w-full p-2">
                <span className="text-black font-semibold">Citation chain</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex-1 ml-4">
          <img src="./assets/Publishing2.png" className="" />
        </div>
      </div>
    </div>
  );
};

export default Publishing;
