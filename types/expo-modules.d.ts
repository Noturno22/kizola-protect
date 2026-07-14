// Ambient module declarations for packages missing .d.ts files in this project.
// These suppress TS7016 errors and provide minimal typing.

declare module 'expo-router' {
  import { ReactNode } from 'react';

  export interface ExpoRouter {
    push: (href: string | { pathname: string; params?: Record<string, string> }) => void;
    replace: (href: string) => void;
    back: () => void;
    canGoBack: () => boolean;
    dismiss: () => void;
    setParams: (params: Record<string, string>) => void;
  }

  export function useRouter(): ExpoRouter;
  export function useLocalSearchParams<T = Record<string, string>>(): T;
  export function useGlobalSearchParams<T = Record<string, string>>(): T;
  export function useSegments(): string[];
  export function useFocusEffect(callback: () => void | (() => void)): void;
  export function usePathname(): string;
  export function useNavigation(): any;
  export function useNavigationContainerRef(): any;
  export function useExpoRouter(): any;
  export function withLayoutContext(...args: any[]): any;

  // Stack/Tabs with .Screen sub-component — used as <Stack.Screen name="..." /> and <Tabs.Screen name="..." />
  interface ScreenComponent {
    (props: { name: string; options?: Record<string, any>; children?: ReactNode }): null;
  }

  interface LayoutComponent {
    (props: { children?: ReactNode; screenOptions?: Record<string, any>; [key: string]: any }): JSX.Element;
    Screen: ScreenComponent;
  }

  export const Stack: LayoutComponent;
  export const Tabs: LayoutComponent;

  export function Link(props: any): JSX.Element;
  export function Redirect(props: any): null;
  export function Slot(props: any): JSX.Element;
  export function ExpoRoot(props: any): JSX.Element;
}

declare module 'expo-router/build' {
  export * from 'expo-router';
}

declare module 'react-native-gesture-handler' {
  import { Component, ReactNode } from 'react';
  import { ViewProps } from 'react-native';

  class GestureHandlerRootView extends Component<ViewProps & { children?: ReactNode }> {}
  export default GestureHandlerRootView;
  export { GestureHandlerRootView };
  export function gestureHandlerRootHOC<P = {}>(component: React.ComponentType<P>): React.ComponentType<P>;
}

// Global Buffer for React Native (expo-file-system uses it)
type BufferEncoding = 'ascii' | 'utf8' | 'utf-8' | 'binary' | 'base64' | 'latin1' | 'hex';
declare class Buffer {
  constructor(value: string | ArrayBuffer | number[], encoding?: BufferEncoding);
  static from(data: string | ArrayBuffer | Uint8Array, encoding?: BufferEncoding): Buffer;
  static from(data: number[]): Buffer;
  toString(encoding?: BufferEncoding): string;
  length: number;
}
