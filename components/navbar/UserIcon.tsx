import { fetchProfileImage } from "@/utils/actions";
import Image from "next/image";
import { LuUser2 } from "react-icons/lu";

const UserIcon = async () => {
  const profileImage = await fetchProfileImage();
  if (profileImage) {
    return (
      <img src={profileImage} className="w-6 h-6 rounded-full object-cover" />
    );
  }
  return <LuUser2 className="w-6 h-6 bg-primary rounded-full text-white" />;
};

export default UserIcon;
