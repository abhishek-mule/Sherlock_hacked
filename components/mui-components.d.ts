// Type definitions for mui-components.js
import { Theme, useTheme as MUIUseTheme } from '@mui/material/styles';
import { 
  BoxProps, 
  ContainerProps, 
  TextFieldProps, 
  ButtonProps, 
  TypographyProps,
  PaperProps,
  TabsProps,
  TabProps,
  CircularProgressProps,
  GridProps,
  CardProps,
  CardContentProps,
  CardHeaderProps,
  DividerProps,
  ListProps,
  ListItemProps,
  ListItemTextProps,
  ListItemIconProps,
  ChipProps,
  AlertProps,
  DialogProps,
  DialogTitleProps,
  DialogContentProps,
  DialogActionsProps,
  AvatarProps,
  IconButtonProps,
  Breakpoint
} from '@mui/material';

// Re-export the component types
export declare const Box: React.ComponentType<BoxProps>;
export declare const Container: React.ComponentType<ContainerProps>;
export declare const TextField: React.ComponentType<TextFieldProps>;
export declare const Button: React.ComponentType<ButtonProps>;
export declare const Typography: React.ComponentType<TypographyProps>;
export declare const Paper: React.ComponentType<PaperProps>;
export declare const Tabs: React.ComponentType<TabsProps>;
export declare const Tab: React.ComponentType<TabProps>;
export declare const CircularProgress: React.ComponentType<CircularProgressProps>;
export declare const Grid: React.ComponentType<GridProps>;
export declare const Card: React.ComponentType<CardProps>;
export declare const CardContent: React.ComponentType<CardContentProps>;
export declare const CardHeader: React.ComponentType<CardHeaderProps>;
export declare const Divider: React.ComponentType<DividerProps>;
export declare const List: React.ComponentType<ListProps>;
export declare const ListItem: React.ComponentType<ListItemProps>;
export declare const ListItemText: React.ComponentType<ListItemTextProps>;
export declare const ListItemIcon: React.ComponentType<ListItemIconProps>;
export declare const Chip: React.ComponentType<ChipProps>;
export declare const Alert: React.ComponentType<AlertProps>;
export declare const Dialog: React.ComponentType<DialogProps>;
export declare const DialogTitle: React.ComponentType<DialogTitleProps>;
export declare const DialogContent: React.ComponentType<DialogContentProps>;
export declare const DialogActions: React.ComponentType<DialogActionsProps>;
export declare const Avatar: React.ComponentType<AvatarProps>;
export declare const IconButton: React.ComponentType<IconButtonProps>;
export declare const useMediaQuery: (query: string | ((theme: Theme) => string)) => boolean;
export declare const useTheme: typeof MUIUseTheme; 