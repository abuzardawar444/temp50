import { fetchProperties } from "@/utils/actions";
import PropertiesList from "./PropertiesList";
import EmptyList from "./EmptyList";
import type { PropertyCardProps } from "@/utils/types";

const PropertiesContainer = async ({
  category,
  search,
}: {
  category?: string;
  search?: string;
}) => {
  // Get properties from backend
  const properties: PropertyCardProps[] = await fetchProperties({
    category,
    search,
  });

  // If no any found return EmptyList
  if (properties.length === 0) {
    return (
      <EmptyList
        heading="No results"
        message="Try changing or removing some of your filters."
        btnText="Clear Filters"
      />
    );
  }

  // But if property is found display PropertiesList
  return <PropertiesList properties={properties} />;
};

export default PropertiesContainer;
