'use client'

import { LayoutBackground } from "@/components/ui/svg";

const AuthLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return (
    <>
      <div className="flex">
        <div className="absolute inset-0">
          <LayoutBackground />
        </div>
        {children}
      </div>
    </>
  )
}

export default AuthLayout;