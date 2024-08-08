/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-08-08 11:31:05
 */
import React from "react";
import EmailInput from "./EmailInput";
import UserList from "./UserList";

function ShareProject({
  handleInvite,
  roomInfo,
  getRoomInfo,
  user,
  handleUpdateUser,
}) {
  return (
    <main className="flex flex-col px-4 mt-4">
      <div className="ml-8">
        <EmailInput handleInvite={handleInvite} />
      </div>
      <section className="self-start mt-7 text-base font-medium text-[1.2rem] text-center text-[#716666]">
        Who has access
      </section>
      <UserList
        roomInfo={roomInfo}
        getRoomInfo={getRoomInfo}
        user={user}
        handleUpdateUser={handleUpdateUser}
      />
    </main>
  );
}

export default ShareProject;