import React from "react";
import { NavBar } from "./NavBar";
import { Wrapper, WrapperProps } from "./Wrapper";

interface LayoutProps extends WrapperProps {}

export const Layout: React.FC<LayoutProps> = ({ variant, children }) => {
  return (
    <>
      <NavBar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  );
};
