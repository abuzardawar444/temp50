import LoadingCards from "@/components/card/LoadingCards";
import CategoriesList from "@/components/home/CategoriesList";
import PropertiesContainer from "@/components/home/PropertiesContainer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Suspense } from "react";

const HomePage = ({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) => {
  return (
    <section>
      <CategoriesList
        category={searchParams.category}
        search={searchParams.search}
      />
      <ErrorBoundary>
        <Suspense fallback={<LoadingCards />}>
          <PropertiesContainer
            category={searchParams.category}
            search={searchParams.search}
          />
        </Suspense>
      </ErrorBoundary>
    </section>
  );
};

export default HomePage;
