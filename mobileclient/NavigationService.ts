import {NavigationContainerRef} from '@react-navigation/native';
import React from 'react';
import {AppParamList} from './types/app.param.list';

export const navigationRef =
  React.createRef<NavigationContainerRef<AppParamList>>();

export const navigate = (
  name: keyof AppParamList,
  params?: AppParamList[keyof AppParamList],
) => {
  if (navigationRef.current?.isReady()) {
    navigationRef.current.navigate(name, params as never);
  } else {
    console.warn('[NAVIGATION] Navigation ref is not ready yet.');
  }
};
