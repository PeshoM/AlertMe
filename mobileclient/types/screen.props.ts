import {
  NavigationContainerRef,
  NavigationProp,
  RouteProp,
} from "@react-navigation/native";
import { ReactNode } from "react";
import { AppParamList } from "./app.param.list";

export type NotificationHandlerProps = {
  children: (
    navigationRef: React.RefObject<NavigationContainerRef<AppParamList>>
  ) => ReactNode;
};

export type ProfileScreenProps = {
  route: RouteProp<{ Profile: { openedUserId: string } }, "Profile">;
};

export type AppNavigatorProps = {
  navigationRef: React.RefObject<NavigationContainerRef<AppParamList>>;
};
