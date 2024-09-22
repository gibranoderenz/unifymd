"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useLogoutFunction,
  User,
  useRedirectFunctions,
} from "@propelauth/nextjs/client";
import { Button } from "../ui/button";

export const NavbarUser: React.FC<{ user: User }> = ({ user }) => {
  const { redirectToLoginPage } = useRedirectFunctions();
  const logout = useLogoutFunction();

  if (!!user) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center justify-center gap-4 bg-[#381E72] text-white w-8 h-8 rounded-full font-semibold">
            {user.firstName?.[0]}
          </button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-4 bg-[#FBF9FF]">
          <span className="font-semib old">
            Welcome, {user.firstName} {user.lastName}
          </span>
          <Button
            className="bg-red-700 hover:bg-red-700/85"
            onClick={() => {
              logout();
              redirectToLoginPage();
            }}
          >
            Logout
          </Button>
        </PopoverContent>
      </Popover>
    );
  }

  return <></>;
};
