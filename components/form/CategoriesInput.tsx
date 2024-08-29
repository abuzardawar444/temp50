import { Label } from "@/components/ui/label";
import { categories } from "@/utils/categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const name = "category";

const CategoriesInput = ({ defaultValue }: { defaultValue?: string }) => {
  return (
    <div className="mb-2">
      <Label htmlFor={name} className="capitalize">
        Categories
      </Label>
      <Select
        defaultValue={defaultValue || categories[0].label}
        name={name}
        required
      >
        <SelectTrigger id={name}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categories.map((item) => {
            return (
              <SelectItem value={item.label} key={item.label}>
                <span className="flex items-center gap-2">
                  <item.icon />
                  {item.label}
                </span>
              </SelectItem>
            );
          })}
          {/* <SelectItem value="pineapple">Pineapple</SelectItem> */}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategoriesInput;
