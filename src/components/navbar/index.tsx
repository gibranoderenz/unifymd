import { getUserOrRedirect } from "@propelauth/nextjs/server/app-router";
import { NavbarUser } from "./user";

export const Navbar = async () => {
  const user = await getUserOrRedirect();

  return (
    <nav className="px-8 py-6 flex items-center justify-between bg-[#FBF9FF] text-[#381E72]">
      <span className="text-lg font-bold">UnifyMD</span>
      <NavbarUser user={JSON.parse(JSON.stringify(user))} />
    </nav>
  );
};
