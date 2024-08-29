import React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const ImageInput = () => {
  return (
    <div className="mb-2 ">
      <Label htmlFor="image" className="capitalize">
        Picture
      </Label>
      <Input
        id="image"
        name="image"
        type="file"
        required
        accept="image/*"
        className="max-w-xs cursor-pointer"
      />
    </div>
  );
};

export default ImageInput;
