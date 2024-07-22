import * as React from "react";
import ContentBar from "./contentBar"
import Grid from "./grid"

import Table from "./table"

const Content = () => {
    return (
        <div className="flex flex-col">
            <ContentBar></ContentBar>
            <div className="flex justify-between gap-5 mt-5 w-full max-md:flex-wrap">
                <div className="text-xl font-semibold  text-center text-black">
                    Projects Dashboard
                </div>
                <div className="flex gap-3.5">
                    <div className="grow my-auto text-base font-medium text-center text-black">
                        Sort By
                    </div>
                    <div className="flex">
                        <img
                            loading="lazy"
                            srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/a2758d7ad32116641a3bd296aad2b425b0a9d0443b83ec872806161d796888dd?apiKey=f537c5c71a7b442c975ebf88445457b6&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/a2758d7ad32116641a3bd296aad2b425b0a9d0443b83ec872806161d796888dd?apiKey=f537c5c71a7b442c975ebf88445457b6&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/a2758d7ad32116641a3bd296aad2b425b0a9d0443b83ec872806161d796888dd?apiKey=f537c5c71a7b442c975ebf88445457b6&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/a2758d7ad32116641a3bd296aad2b425b0a9d0443b83ec872806161d796888dd?apiKey=f537c5c71a7b442c975ebf88445457b6&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/a2758d7ad32116641a3bd296aad2b425b0a9d0443b83ec872806161d796888dd?apiKey=f537c5c71a7b442c975ebf88445457b6&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/a2758d7ad32116641a3bd296aad2b425b0a9d0443b83ec872806161d796888dd?apiKey=f537c5c71a7b442c975ebf88445457b6&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/a2758d7ad32116641a3bd296aad2b425b0a9d0443b83ec872806161d796888dd?apiKey=f537c5c71a7b442c975ebf88445457b6&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/a2758d7ad32116641a3bd296aad2b425b0a9d0443b83ec872806161d796888dd?apiKey=f537c5c71a7b442c975ebf88445457b6&"
                            className="shrink-0 rounded aspect-[1.23] w-[26px]"
                        />
                        <img
                            loading="lazy"
                            srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/7c968d46e2f621466876c121a20dcf961534772076b5186c42a9ecd765c7bf39?apiKey=f537c5c71a7b442c975ebf88445457b6&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/7c968d46e2f621466876c121a20dcf961534772076b5186c42a9ecd765c7bf39?apiKey=f537c5c71a7b442c975ebf88445457b6&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/7c968d46e2f621466876c121a20dcf961534772076b5186c42a9ecd765c7bf39?apiKey=f537c5c71a7b442c975ebf88445457b6&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/7c968d46e2f621466876c121a20dcf961534772076b5186c42a9ecd765c7bf39?apiKey=f537c5c71a7b442c975ebf88445457b6&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/7c968d46e2f621466876c121a20dcf961534772076b5186c42a9ecd765c7bf39?apiKey=f537c5c71a7b442c975ebf88445457b6&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/7c968d46e2f621466876c121a20dcf961534772076b5186c42a9ecd765c7bf39?apiKey=f537c5c71a7b442c975ebf88445457b6&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/7c968d46e2f621466876c121a20dcf961534772076b5186c42a9ecd765c7bf39?apiKey=f537c5c71a7b442c975ebf88445457b6&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/7c968d46e2f621466876c121a20dcf961534772076b5186c42a9ecd765c7bf39?apiKey=f537c5c71a7b442c975ebf88445457b6&"
                            className="shrink-0 rounded-none aspect-[1.23] w-[26px]"
                        />
                    </div>
                    <div className="flex gap-2 p-1.5 text-xs leading-4 text-center text-black rounded bg-zinc-300">
                        <div className="grow">last modified</div>
                        <img
                            loading="lazy"
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/8744c7abfce57fdf1901bd5cffbe12851185e9fb4c9749114d01477bf97db232?apiKey=f537c5c71a7b442c975ebf88445457b6&"
                            className="shrink-0 w-3 aspect-square"
                        />
                    </div>
                </div>
            </div>
            <div className="mt-5">
                {/* <Grid></Grid> */}
                <Table></Table>
            </div>
        </div>
    );
}

export default Content;