import Link from "next/link";
import { Button } from "../ui/button";
const EmptyList = ({
  heading = "No items in the list.",
  message = "Keep exploring our properties",
  btnText = "back home",
}: {
  heading?: string;
  message?: string;
  btnText?: string;
}) => {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold">{heading}</h2>
      <p className="text-lg">{message}</p>
      {/* Button is tagged with asChild because we want to put Link inside it. For doing this Link looks like button but acts like link (navigate to href when clicked) */}
      <Button asChild className="mt-4 capitalize" size="lg">
        <Link href="/">{btnText}</Link>
      </Button>
    </div>
  );
};
export default EmptyList;
