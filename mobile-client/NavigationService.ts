import { createRef } from "react";
import { NavigationContainerRef } from "@react-navigation/native";
import { AppParamList } from "./types/app.param.list";

// Create a global reference to the navigation container
export const navigationRef = createRef<NavigationContainerRef<AppParamList>>();
