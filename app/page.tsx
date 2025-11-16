"use client";
import { useUser } from "@clerk/nextjs";
import Wrapper from "./components/Wrapper";
import ProductOverview from "./components/ProductOverview";
import CategoryChart from "./CategoryChart";
import StockLevels from "./components/StockLevels";
import CriticalProducts from "./components/CriticalProducts";

export default function Home() {

const { user } = useUser()
const email = user?.primaryEmailAddress?.emailAddress as string

  return (
   <Wrapper>
  <div className="flex flex-col md:flex-row gap-4">
    <div className="md:w-2/3">
      <ProductOverview email={email} />
      <CategoryChart email={email} />
    </div>
    <div className="md:w-1/3">
      <StockLevels email={email} />
      <CriticalProducts email={email} />
    </div>
  </div>
  </Wrapper>

  );
}
