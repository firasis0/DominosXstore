import { Search } from "lucide-react";

import { Input } from "@/Components/ui/input";
import {
  Select,
  SelectItem
} from "@/Components/ui/select";

import styles from "./styles.module.scss";

const CategoryToolbar = ({
  search,
  setSearch,
  status,
  setStatus
}) => {
  return (
    <div className={styles.Toolbar}>
      <div className={styles.Toolbar__Search}>
        <Search size={16} />

        <Input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search categories..."
        />
      </div>

      <Select
        value={status}
        onValueChange={setStatus}
        className={styles.Toolbar__Select}
      >
        <SelectItem value="all">
          All statuses
        </SelectItem>

        <SelectItem value="active">
          Active
        </SelectItem>

        <SelectItem value="inactive">
          Inactive
        </SelectItem>
      </Select>
    </div>
  );
};

export default CategoryToolbar;