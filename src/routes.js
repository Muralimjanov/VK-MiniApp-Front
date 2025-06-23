import {
  createHashRouter,
  createPanel,
  createRoot,
  createView,
  RoutesConfig,
} from '@vkontakte/vk-mini-apps-router';

export const DEFAULT_ROOT = 'default_root';

export const DEFAULT_VIEW = 'default_view';

export const DEFAULT_VIEW_PANELS = {
  HOME: 'home',
  USER_EQUIPMENTS: 'user_equipments',
  USER_EQUIPMENTS2: 'user_equipments2',
  ADMIN_EQUIPMENTS: 'admin_equipments',
  ADMIN_USERS: 'admin_users',
  ADMIN_APPLICATIONS: 'admin_applications',
  ADMIN_APPLICATIONS_TABLE1: 'admin_applications_table1',
  ADMIN_APPLICATIONS_TABLE2: 'admin_applications_table2',
  PERSIK: 'persik',
};

// export const routes = RoutesConfig.create([
//   createRoot(DEFAULT_ROOT, [
//     createView(DEFAULT_VIEW, [
//       // createPanel(DEFAULT_VIEW_PANELS.EQUIPMENT, '/', []),
//       createPanel(DEFAULT_VIEW_PANELS.USER_EQUIPMENTS, '/', []),
//       createPanel(DEFAULT_VIEW_PANELS.USER_EQUIPMENTS, `/${DEFAULT_VIEW_PANELS.USER_EQUIPMENTS}`, []),
//       createPanel(DEFAULT_VIEW_PANELS.USER_EQUIPMENTS2, `/${DEFAULT_VIEW_PANELS.USER_EQUIPMENTS2}`, []),
//       createPanel(DEFAULT_VIEW_PANELS.ADMIN_EQUIPMENTS, `/${DEFAULT_VIEW_PANELS.ADMIN_EQUIPMENTS}`, []),
//       createPanel(DEFAULT_VIEW_PANELS.ADMIN_USERS, `/${DEFAULT_VIEW_PANELS.ADMIN_USERS}`, []),
//       createPanel(DEFAULT_VIEW_PANELS.ADMIN_APPLICATIONS, `/${DEFAULT_VIEW_PANELS.ADMIN_APPLICATIONS}`, []),
//       createPanel(DEFAULT_VIEW_PANELS.PERSIK, `/${DEFAULT_VIEW_PANELS.PERSIK}`, []),
//     ]),
//   ]),
// ]);

export const routes = RoutesConfig.create([
  createRoot(DEFAULT_ROOT, [
    createView(DEFAULT_VIEW, [
      createPanel(DEFAULT_VIEW_PANELS.HOME, '/', []),
      createPanel(DEFAULT_VIEW_PANELS.USER_EQUIPMENTS, `/${DEFAULT_VIEW_PANELS.USER_EQUIPMENTS}`, []),
      createPanel(DEFAULT_VIEW_PANELS.USER_EQUIPMENTS2, `/${DEFAULT_VIEW_PANELS.USER_EQUIPMENTS2}`, []),
      createPanel(DEFAULT_VIEW_PANELS.ADMIN_EQUIPMENTS, `/${DEFAULT_VIEW_PANELS.ADMIN_EQUIPMENTS}`, []),
      createPanel(DEFAULT_VIEW_PANELS.ADMIN_USERS, `/${DEFAULT_VIEW_PANELS.ADMIN_USERS}`, []),
      createPanel(DEFAULT_VIEW_PANELS.ADMIN_APPLICATIONS, `/${DEFAULT_VIEW_PANELS.ADMIN_APPLICATIONS}`, []),
      createPanel(DEFAULT_VIEW_PANELS.PERSIK, `/${DEFAULT_VIEW_PANELS.PERSIK}`, []),
    ]),
  ]),
]);

export const router = createHashRouter(routes.getRoutes());
