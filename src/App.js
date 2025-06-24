import React, { useState, useEffect, useContext } from "react";
import {
  View,
  SplitLayout,
  SplitCol,
  ScreenSpinner,
  FixedLayout,
} from "@vkontakte/vkui";
import { useActiveVkuiLocation } from "@vkontakte/vk-mini-apps-router";
import { DataContext } from "./context/dataContext";

import {
  Persik,
  UserEquipments,
  UserEquipments2,
  AdminEquipments,
  AdminUsers,
  Home,
  AdminApplications,
} from "./panels";

import { AuthProvider, AuthContext } from "./context/authContext";
import LoginPanel from "./components/LoginPanel";
import MainButtons from "./components/MainButtons.js";
import { Box } from "@mui/joy";
import { DEFAULT_VIEW, DEFAULT_VIEW_PANELS } from './routes.js';
import { useVKAuth } from './hooks/useVKAuth';

const AppContent = () => {
  useVKAuth();
  const { isAuthenticated, loading, role } = useContext(AuthContext);
  const { panel: activePanel = DEFAULT_VIEW_PANELS.HOME } = useActiveVkuiLocation();
  const [popout, setPopout] = useState(<ScreenSpinner />);
  const [data, setData] = useState({ equipments: null });

  useEffect(() => {
    if (!loading) {
      setPopout(null);
    }
  }, [loading]);
  
  useEffect(() => {
    console.log('Role changed:', role, typeof role);
  }, [role]);

  if (loading) return <ScreenSpinner />;
  if (!isAuthenticated) return <LoginPanel id="login" />;


  console.log('Checking admin role:', role, role === '2', Boolean(role === '2'));
  console.log('Текущая роль:', role, typeof role);

  // Проверяем, является ли пользователь админом
  const isAdmin = role === '2' || role === 2;
  console.log('Is admin:', isAdmin);

  return (
    <DataContext.Provider value={{ data, setData }}>
      <SplitLayout popout={popout}>
        <SplitCol>
          <FixedLayout filled vertical="bottom">
            <Box display="flex" justifyContent="center" alignItems="center">
              <MainButtons />
            </Box>
          </FixedLayout>

          <View activePanel={activePanel} nav={DEFAULT_VIEW} id={DEFAULT_VIEW}>
            <Home id={DEFAULT_VIEW_PANELS.HOME} />
            <UserEquipments id={DEFAULT_VIEW_PANELS.USER_EQUIPMENTS} />
            <UserEquipments2 id={DEFAULT_VIEW_PANELS.USER_EQUIPMENTS2} />
            
            <AdminEquipments 
              id={DEFAULT_VIEW_PANELS.ADMIN_EQUIPMENTS} 
            />
            <AdminUsers 
              id={DEFAULT_VIEW_PANELS.ADMIN_USERS} 
            />
            <AdminApplications 
              id={DEFAULT_VIEW_PANELS.ADMIN_APPLICATIONS} 
            />

            <Persik id={DEFAULT_VIEW_PANELS.PERSIK} />
          </View>
        </SplitCol>
      </SplitLayout>
    </DataContext.Provider>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};