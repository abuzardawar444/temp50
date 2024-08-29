"use client";

import { SignOutButton } from "@clerk/nextjs";
import { useToast } from "../ui/use-toast";

const SignOutLink = () => {
  const { toast } = useToast();
  function handleLogout() {
    toast({ description: "You have been signed out" });
  }

  return (
    <SignOutButton redirectUrl="/">
      <button className="w-full text-left" onClick={handleLogout}>
        Logout
      </button>
    </SignOutButton>
  );
};

export default SignOutLink;
