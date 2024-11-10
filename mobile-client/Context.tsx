import { IUser } from "./interfaces/user.interface";
import React, { createContext, useState } from "react";
import { userContextProps } from "./interfaces/userContext.interface";
const UserContext = createContext({} as any);

const Context = ({ children }: userContextProps) => {
  const [authenticatedUser, setAuthenticatedUser] = useState<IUser | null>();
  return (
    <UserContext.Provider
      value={{
        authenticatedUser,
        setAuthenticatedUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { Context, UserContext };
