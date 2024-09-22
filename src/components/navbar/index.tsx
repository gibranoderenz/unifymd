import { getUserOrRedirect } from "@propelauth/nextjs/server/app-router";
import Image from "next/image";
import Link from "next/link";
import { NavbarUser } from "./user";

export const Navbar = async () => {
  const user = await getUserOrRedirect();

  return (
    <nav className="px-8 flex items-center justify-between bg-[#FBF9FF] text-[#381E72]">
      <Link href={"/"}>
        <div className="relative w-[100px] h-[80px] scale-150">
          <Image
            src={"/assets/logo.png"}
            alt="UnifyMD logo"
            fill
            className="absolute object-contain"
          />
        </div>
      </Link>

      <NavbarUser user={JSON.parse(JSON.stringify(user))} />
    </nav>
  );
};
