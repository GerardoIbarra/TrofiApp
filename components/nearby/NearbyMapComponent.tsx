import React from 'react';
import { Platform } from 'react-native';
import { NearbyMapProps } from './types';
import NativeMap from './NearbyMapComponent.native';
import WebMap from './NearbyMapComponent.web';

export default function NearbyMapComponent(props: NearbyMapProps) {
  if (Platform.OS === 'web') {
    return <WebMap {...props} />;
  }
  return <NativeMap {...props} />;
}
