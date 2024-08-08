import React, { useState, useMemo, useEffect } from "react";
import {getColors} from "@/util"
import Permission from "./Permission"; 
import { toast } from "react-toastify";

function UserItem({
  name,
  email,
  status,
  index,
  isRemove,
  onRemove,
  user,
  handleUpdateUser,
}) {
  const [userStatus, setUserStatus] = useState(status);

  useEffect(() => {
    setUserStatus(status);
  }, [status]);

  const handleStatusChange = async (event) => {
    const selectedValue = event.target.value;
    if (selectedValue === "remove") {
      onRemove(email);
    } else {
      setUserStatus(selectedValue);
      await handleUpdateUser(email, selectedValue);
    }
  };
  return (
    <div className="flex justify-between items-center gap-3.5 mb-4  w-full">
      <div className="flex gap-3.5 items-center">
        <div
          className={`flex items-center justify-center w-8 h-8 text-white rounded-full`}
          style={{ backgroundColor: getColors(index) }}
        >
          {name?.charAt(0)?.toUpperCase()}
        </div>
        <div className="text-[1rem] text-[#000000] font-sans font-[600]">
          {email}
          {user.email == email && <span className="text-stone-500">(you)</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {status === "Owner" ? (
          <div className="text-[0.9rem] text-[#000000] font-sans font-[600]">
            {status}
          </div>
        ) : (
          <Permission
            status={userStatus}
            onChange={handleStatusChange}
            isRemove={isRemove}
          />
        )}
      </div>
    </div>
  );
}

function UserList({ roomInfo, getRoomInfo, user, handleUpdateUser }) {
  const onRemove = (email) => {
    console.log("remove", email);
  };

  const getIsRemove = (item, user) => {
    return user.email == item?.email
      ? {
          status: "Owner",
        }
      : {
          status: item.access,
          isRemove: true,
          onRemove: onRemove,
        };
  };

  const users = useMemo(() => {
    return roomInfo?.accessList?.map((item, index) => {
      return {
        ...item,
        ...getIsRemove(item, user),
      };
    });
  }, [roomInfo]);

  return (
    <div className="my-5 w-full">
      <div className="flex gap-5 max-md:flex-col">
        <div className="flex flex-col w-[100%] max-md:ml-0 max-md:w-full">
          <div className="flex flex-col items-start w-full text-xs font-medium leading-none text-center max-md:mt-10">
            {users?.map((item, index) => (
              <UserItem
                key={index}
                index={index}
                user={user}
                handleUpdateUser={handleUpdateUser}
                {...item}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserList;
