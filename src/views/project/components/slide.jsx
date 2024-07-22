import * as React from "react";

const Slide = () => {
    return (
        <div className="flex flex-col grow px-2 w-full text-base font-semibold leading-4 text-center text-black border-0 border-black border-solid shadow-sm bg-zinc-200 pt-4">
            <div className="flex gap-5 px-5 py-3 rounded-2xl my-1">
                <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/77e23e5553a3cc4581bdf19973492ee414e8b687eaecda05f5597e7a24e170ba?apiKey=f537c5c71a7b442c975ebf88445457b6&"
                    className="shrink-0 aspect-square w-[28px]"
                />
                <div className="my-auto">New Project</div>
            </div>
            <div className="flex gap-5 px-5 py-3 rounded-2xl bg-green-300 my-1">
                <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/77e23e5553a3cc4581bdf19973492ee414e8b687eaecda05f5597e7a24e170ba?apiKey=f537c5c71a7b442c975ebf88445457b6&"
                    className="shrink-0 aspect-square w-[28px]"
                />
                <div className="my-auto">All Projects</div>
            </div>
            <div className="flex gap-5 px-5 py-3 rounded-2xl my-1">
                <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/77e23e5553a3cc4581bdf19973492ee414e8b687eaecda05f5597e7a24e170ba?apiKey=f537c5c71a7b442c975ebf88445457b6&"
                    className="shrink-0 aspect-square w-[28px]"
                />
                <div className="my-auto">Trash</div>
            </div>
            <div className="flex gap-5 px-5 py-3 rounded-2xl my-1">
                <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/77e23e5553a3cc4581bdf19973492ee414e8b687eaecda05f5597e7a24e170ba?apiKey=f537c5c71a7b442c975ebf88445457b6&"
                    className="shrink-0 aspect-square w-[28px]"
                />
                <div className="my-auto">Project Category</div>
            </div>
            <div className="flex flex-col justify-start grow px-5">
                <div className="flex flex-col ml-2">
                    <div className="flex gap-5 justify-start mt-2 whitespace-nowrap">
                        <div className="shrink-0 self-start bg-green-300 rounded-full h-[15px] w-[15px]" />
                        <div className="my-auto">Sub Category 1</div>
                    </div>
                    <div className="flex gap-5 justify-start mt-7 whitespace-nowrap">
                        <div className="shrink-0 self-start bg-green-300 rounded-full h-[15px] w-[15px]" />
                        <div className="my-auto">Sub Category 2</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Slide;