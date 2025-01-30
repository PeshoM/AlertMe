import {
  NavigationContainerRef,
  NavigationProp,
} from "@react-navigation/native";
import { ReactNode } from "react";
import { AppParamList } from "./app.param.list";

export type LoginScreenProps = {
  navigation: NavigationProp<any>;
};

export type RegisterScreenProps = {
  navigation: NavigationProp<any>;
};

export type HomeScreenProps = {
  navigation: NavigationProp<any>;
};

export type useFcmTokenProps = {
  navigation: NavigationProp<any>;
};

export type FriendsScreenProps = {
  navigation: NavigationProp<any>;
};

export type NotificationHandlerProps = {
  children: (
    navigationRef: React.RefObject<NavigationContainerRef<AppParamList>>
  ) => ReactNode;
};

export type AppNavigatorProps = {
  navigationRef: React.RefObject<NavigationContainerRef<AppParamList>>;
};
