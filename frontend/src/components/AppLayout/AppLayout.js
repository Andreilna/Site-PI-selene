import { useState } from "react";
import styles from "@/styles/Home.module.css";

import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";

export default function AppLayout({ children, title }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    const isMobileView = typeof window !== "undefined" && window.innerWidth <= 1024;

    if (isMobileView) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className={styles.dashboard}>
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} isCollapsed={isSidebarCollapsed} />
      <main className={styles.mainContent} data-sidebar-collapsed={isSidebarCollapsed}>
        <Header
          onMenuClick={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          isSidebarCollapsed={isSidebarCollapsed}
          title={title}
        />
        <div className={styles.pageBody}>{children}</div>
      </main>
    </div>
  );
}

