import {
  AUTH_ROLES,
  AuthRole,
} from '../auth/constants/auth-roles';

import {
  AppNavigationItem,
} from './app-navigation.model';


const CATALOG_ITEM: AppNavigationItem = {
  label: 'Каталог',
  routerLink: '/',
  exact: true,
  icon: 'catalog',
};


const STUDENT_NAVIGATION: readonly AppNavigationItem[] = [
  CATALOG_ITEM,
  {
    label: 'За мен',
    routerLink: '/for-me',
    exact: false,
    icon: 'for-me',
  },
  {
    label: 'Моята библиотека',
    routerLink: '/my-library',
    exact: false,
    icon: 'my-library',
  },
];


const TEACHER_NAVIGATION: readonly AppNavigationItem[] = [
  CATALOG_ITEM,
  {
    label: 'Моите ресурси',
    routerLink: '/teacher',
    exact: true,
    icon: 'my-resources',
  },
  {
    label: 'Добави ресурс',
    routerLink: '/teacher/resources/new',
    exact: false,
    icon: 'add-resource',
  },
];


const ADMIN_NAVIGATION: readonly AppNavigationItem[] = [
  ...TEACHER_NAVIGATION,
  {
    label: 'Администрация',
    routerLink: '/admin',
    exact: false,
    icon: 'administration',
  },
];


export function getAppNavigation(
  role: AuthRole | null
): readonly AppNavigationItem[] {
  if (role === AUTH_ROLES.Admin) {
    return ADMIN_NAVIGATION;
  }

  if (role === AUTH_ROLES.Teacher) {
    return TEACHER_NAVIGATION;
  }

  if (role === AUTH_ROLES.Student) {
    return STUDENT_NAVIGATION;
  }

  return [CATALOG_ITEM];
}
