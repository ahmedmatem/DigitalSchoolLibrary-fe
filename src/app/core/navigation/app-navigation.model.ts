export type AppNavigationIcon =
  | 'catalog'
  | 'for-me'
  | 'my-library'
  | 'my-resources'
  | 'add-resource'
  | 'administration'
  | 'moderation'
  | 'users';


export interface AppNavigationItem {
  readonly label: string;
  readonly routerLink: string;
  readonly exact: boolean;
  readonly icon: AppNavigationIcon;
}
