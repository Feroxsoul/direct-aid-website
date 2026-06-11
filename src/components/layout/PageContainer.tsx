import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
};

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="container-2 mx-auto flex w-full flex-col items-center pb-10">
      {children}
    </div>
  );
}
