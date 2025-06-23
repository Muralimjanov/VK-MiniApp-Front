// import React, { useState, useEffect } from 'react';
// import bridge from '@vkontakte/vk-bridge';

// import { View, SplitLayout, SplitCol, ScreenSpinner, FixedLayout, Separator, TabsItem, Epic, usePlatform,
//   useAdaptivityConditionalRender
// } from '@vkontakte/vkui';
// import { useActiveVkuiLocation } from '@vkontakte/vk-mini-apps-router';

// import { Persik, Equipments, UserEquipments,UserEquipments2, AdminEquipments, AdminUsers, Home, AdminApplications} from './panels';
// import { DEFAULT_VIEW_PANELS } from './routes';
// import PropTypes from "prop-types";
// import MainButtons from "./components/MainButtons.js"
// import {Box} from "@mui/joy";

// export const App = () => {
//   // return (
//   //     <label>test24</label>
//   // );
//   const { panel: activePanel = DEFAULT_VIEW_PANELS.HOME } = useActiveVkuiLocation();
//   const [fetchedUser, setUser] = useState();
//   const [popout, setPopout] = useState(<ScreenSpinner />);
//   // const [activeTab, setActiveTab] = useState('groups');
//   const platform = usePlatform();
//   const { viewWidth } = useAdaptivityConditionalRender();
//   const [activeStory, setActiveStory] = useState('profile');
//   const activeStoryStyles = {
//     backgroundColor: 'var(--vkui--color_background_secondary)',
//     borderRadius: 8
//   };
//   const onStoryChange = (e) => setActiveStory(e.currentTarget.dataset.story);
//   const hasHeader = platform !== 'vkcom';

//   useEffect(() => {
//     async function fetchData() {
//       const user = await bridge.send('VKWebAppGetUserInfo');
//       setUser(user);
//       await loginWithVK(user);
//       setPopout(null);
//     }
//     fetchData();
//     // setUser({
//     //   photo_200: 'test',
//     //   first_name: 'Test',
//     //   last_name: 'Testovich',
//     //   city: PropTypes.shape({
//     //     title: 'Kodinsk',
//     //   })});
//       setPopout(null);
//   }, []);


//   return (
//     <SplitLayout>
//       <SplitCol>
//       <FixedLayout filled vertical="bottom">
//           <Box
//               display="flex"
//               justifyContent="center"
//               alignItems="center"
//           >
//               <MainButtons></MainButtons>
//           </Box>
//       </FixedLayout>
//         <View activePanel={activePanel}>
//           <Home id={DEFAULT_VIEW_PANELS.HOME} fetchedUser={fetchedUser} />
//           <UserEquipments id={DEFAULT_VIEW_PANELS.USER_EQUIPMENTS} fetchedUser={fetchedUser} />
//           <UserEquipments2 id={DEFAULT_VIEW_PANELS.USER_EQUIPMENTS2} fetchedUser={fetchedUser} />
//           <AdminEquipments id={DEFAULT_VIEW_PANELS.ADMIN_EQUIPMENTS} fetchedUser={fetchedUser} />
//           <AdminUsers id={DEFAULT_VIEW_PANELS.ADMIN_USERS} fetchedUser={fetchedUser} />
//           <AdminApplications id={DEFAULT_VIEW_PANELS.ADMIN_APPLICATIONS} fetchedUser={fetchedUser} />
//           <Persik id="persik" />
//         </View>
//       </SplitCol>
//       {popout}
//     </SplitLayout>
//   );
// };

// App.js
import React, { useState, useEffect } from "react";
import {
  View,
  SplitLayout,
  SplitCol,
  ScreenSpinner,
  FixedLayout,
} from "@vkontakte/vkui";
import { useActiveVkuiLocation } from "@vkontakte/vk-mini-apps-router";
import {DataContext} from "./context/dataContext"

import {
  Persik,
  UserEquipments,
  UserEquipments2,
  AdminEquipments,
  AdminUsers,
  Home,
  AdminApplications,
} from "./panels";

import MainButtons from "./components/MainButtons.js";
import { Box } from "@mui/joy";
import { instance } from "./api/axios.js";
import { DEFAULT_VIEW, DEFAULT_VIEW_PANELS } from './routes.js';

export const App = () => {
  const { panel: activePanel = DEFAULT_VIEW_PANELS.HOME } = useActiveVkuiLocation();
  const [fetchedUser, setUser] = useState(null);
  const [popout, setPopout] = useState(<ScreenSpinner />);
  const [role, setRole] = useState(null);
  const [data, setData] = useState({ equipments: null }); // 👈 контекст состояния

  useEffect(() => {
    const authorize = async () => {

     

      try {
        const vkLoginPayload = {
          vk_user_id: "123456723",
          sign: "rd8b7_OQokTrks00aXOl97N6Tw18_1Qw0zNrVIWx2jc",
          is_group_creator: true,
          bypass_signature: true,
        };

        const response = await instance.post("/api/auth/vk-login", vkLoginPayload);
        const { token, user } = response;

        if (!user?.id_rol) throw new Error("Роль не определена");

        localStorage.setItem("token", token);
        localStorage.setItem("role", user.id_rol);
        setRole(String(user.id_rol));
      } catch (error) {
        console.error("Ошибка авторизации:", error.message || error);
        alert(`Ошибка авторизации: ${error.message || error}`);
      } finally {
        setPopout(null);
      }
    };

    authorize();
  }, []);

  if (!role) return <ScreenSpinner />;

console.log('activePanel:', activePanel);

console.log("🪪 Токен:", localStorage.getItem('token'));
console.log("axios ответ (user):", data.user);

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
           
                <UserEquipments id={DEFAULT_VIEW_PANELS.USER_EQUIPMENTS} fetchedUser={fetchedUser}/>
                <UserEquipments2 id={DEFAULT_VIEW_PANELS.USER_EQUIPMENTS2} />
             
          
                <AdminEquipments id={DEFAULT_VIEW_PANELS.ADMIN_EQUIPMENTS} />
                <AdminUsers id={DEFAULT_VIEW_PANELS.ADMIN_USERS} />
                <AdminApplications id={DEFAULT_VIEW_PANELS.ADMIN_APPLICATIONS} />
              
          
            <Persik id={DEFAULT_VIEW_PANELS.PERSIK} />
          </View>
        </SplitCol>
      </SplitLayout>
    </DataContext.Provider>
  );
};
