import React from "react";

const ArInput = ({
  label,
  type,
  name,
  placeholder,
  register,
  errors,
  icon,
}) => (
  <div className="mb-4 relative">
    <label className="block text-arxTextGray text-sm font-bold mb-1 font-sans">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 pl-2">
        <img src={icon} alt="Icon" className="h-5 w-5" />
      </div>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className={`input-field w-full pl-8 pr-3 py-2 bg-transparent border-b-2 ${errors[name] ? "border-red-500" : "border-gray-300"
          } transition-colors duration-300 focus:outline-none focus:border-green-500`}
        {...register(name)}
      />
    </div>
    {errors[name] && (
      <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>
    )}
  </div>
);

export default ArInput;
