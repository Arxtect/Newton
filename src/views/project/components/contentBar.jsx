import * as React from "react";

const ContentBar = () => {
    return (
        <div className="flex gap-5 items-center justify-between w-full font-medium text-center mt-2">
            <div className="flex items-center gap-5 px-9 py-2 text-xl bg-gray-200 rounded-2xl text-stone-500 h-[100%]">
                <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/10a6e14681440310509fd7ba802dfbed9962c2effcaad8d8a066db93f841599f?apiKey=f537c5c71a7b442c975ebf88445457b6&"
                    className="w-4 h-4"
                />
                <div>Search in Projects</div>
            </div>
            <div className="flex gap-3.5 h-full">
                <div className="grow my-auto text-black">
                    You’re on the free plan
                </div>
                <div className="my-1 px-3 flex items-center text-white whitespace-nowrap bg-green-500 rounded-xl">
                    Upgrade
                </div>
            </div>
        </div>
    );
}

export default ContentBar;