import { UserDataProvider } from "@/hooks/use-userdata"

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserDataProvider>
      {children}
    </UserDataProvider>
  );
}

export default AuthLayout;