import Sidebar from "@/components/feature/dashboard/sidebar/sidebar";

interface Props {}

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="w-full h-screen flex flex-row">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default RootLayout;
