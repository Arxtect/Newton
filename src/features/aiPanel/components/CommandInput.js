import React from "react";

const CommandInput = () => {
  return (
    <div className="flex flex-wrap gap-5 justify-between ml-2.5 w-full rounded-none text-stone-500 max-md:max-w-full">
      <div className="flex gap-3">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/ba2826dfedc46423da960defd8b842203f5f4a4df7a2c0b590028eb88ffa3b9a?apiKey=6856840afbf04beb865bb666a8346f6d&"
          className="object-contain shrink-0 w-6 aspect-square"
          alt=""
        />
        <label htmlFor="commandInput" className="my-auto basis-auto">
          Type a command or question
        </label>
      </div>
      <input
        type="text"
        id="commandInput"
        className="sr-only"
        aria-label="Type a command or question"
      />
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/3a8f6fe48b60e23bcd440123fd980a657feba1b4f1a14e3465a06f70616f3fc8?apiKey=6856840afbf04beb865bb666a8346f6d&"
        className="object-contain shrink-0 w-6 aspect-square"
        alt=""
      />
    </div>
  );
};

export default CommandInput;
