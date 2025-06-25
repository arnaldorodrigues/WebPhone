"use client";

import Sidebar from "@/components/feature/phone/sidebar/sidebar";
import { usePathname } from "next/navigation";
import { useSIPProvider } from "@/hooks/sip-provider/sip-provider-context";
import { useUserData } from "@/hooks/use-userdata";
import { useEffect, useRef } from "react";
import { CONNECT_STATUS, RegisterStatus } from "@/types/sip-type";
import { useNotification } from "@/contexts/notification-context";
import { useWebSocket } from "@/contexts/websocket-context";

interface Props {}

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathname = usePathname();
  const sidebarVisible = pathname.endsWith("phone");
  const { sipConfig, isLoading } = useUserData();
  const { connectAndRegister, connectStatus, registerStatus } =
    useSIPProvider();
  const hasAttemptedConnect = useRef(false);
  const { showNotification } = useNotification();
  const { userData, refreshUserData } = useUserData();
  const { subscribe } = useWebSocket();

  useEffect(() => {
    if (
      !hasAttemptedConnect.current &&
      sipConfig &&
      sipConfig.username &&
      sipConfig.password &&
      sipConfig.server &&
      !isLoading &&
      sipConfig &&
      connectStatus === CONNECT_STATUS.WAIT_REQUEST_CONNECT &&
      registerStatus !== RegisterStatus.REGISTERED
    ) {
      try {
        hasAttemptedConnect.current = true;
        connectAndRegister(sipConfig);
      } catch (error) {
        console.error("Failed to connect and register:", error);
      }
    }
  }, [sipConfig, connectAndRegister, isLoading, connectStatus, registerStatus]);

  useEffect(() => {
    const unsubscribe = subscribe((wsMessage: any) => {
      if (
        wsMessage?.type === "new_sms" &&
        wsMessage?.messageId &&
        wsMessage?.body &&
        wsMessage?.from &&
        wsMessage?.timestamp
      ) {
        showNotification(
          "New SMS",
          `You got a new SMS from ${wsMessage.from}`,
          "info"
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userData?.id, subscribe]);

  return (
    <div className="w-full h-full flex-1 flex flex-row ">
      <Sidebar hidden={!sidebarVisible} />
      <div className={`flex-1 ${sidebarVisible && "hidden"}}`}>{children}</div>
    </div>
  );
};

export default RootLayout;
