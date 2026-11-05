import Footer from "@/components/layout/Footer";
import React from "react";

const MainStoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {children}
      <Footer />
    </div>
  );
};

export default MainStoreLayout;
