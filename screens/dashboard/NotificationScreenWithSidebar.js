import React from 'react';
import SidebarLayout from './SidebarLayout';
import NotificationScreen from './NotificationScreen';

export default function NotificationScreenWithSidebar(props) {
  return (
    <SidebarLayout activeTab="Notification" {...props}>
      <NotificationScreen {...props} />
    </SidebarLayout>
  );
}
