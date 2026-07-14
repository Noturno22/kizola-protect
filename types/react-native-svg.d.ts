declare module 'react-native-svg' {
  import { Component } from 'react';
  import { ViewProps, StyleProp, ColorValue, ViewStyle } from 'react-native';

  export interface SvgProps extends ViewProps {
    width?: number | string;
    height?: number | string;
    viewBox?: string;
    color?: ColorValue;
    fill?: ColorValue;
    fillOpacity?: number;
    fillRule?: 'evenodd' | 'nonzero';
    stroke?: ColorValue;
    strokeWidth?: number | string;
    strokeDasharray?: number[] | string;
    strokeDashoffset?: number;
    strokeLinecap?: 'butt' | 'square' | 'round';
    strokeLinejoin?: 'miter' | 'bevel' | 'round';
    strokeMiterlimit?: number;
    strokeOpacity?: number;
    opacity?: number;
    clipPath?: string;
    clipRule?: 'evenodd' | 'nonzero';
    transform?: string;
    id?: string;
    style?: StyleProp<ViewStyle>;
    [key: string]: any;
  }

  export default class Svg extends Component<SvgProps> {}
  export class Circle extends Component<SvgProps> {}
  export class Ellipse extends Component<SvgProps> {}
  export class G extends Component<SvgProps> {}
  export class Text extends Component<SvgProps> {}
  export class TSpan extends Component<SvgProps> {}
  export class TextPath extends Component<SvgProps> {}
  export class Path extends Component<SvgProps> {}
  export class Polygon extends Component<SvgProps> {}
  export class Polyline extends Component<SvgProps> {}
  export class Line extends Component<SvgProps> {}
  export class Rect extends Component<SvgProps> {}
  export class Use extends Component<SvgProps> {}
  export class Image extends Component<SvgProps> {}
  export class Symbol extends Component<SvgProps> {}
  export class Defs extends Component<{ children?: React.ReactNode }> {}
  export class LinearGradient extends Component<SvgProps> {}
  export class RadialGradient extends Component<SvgProps> {}
  export class Stop extends Component<SvgProps> {}
  export class ClipPath extends Component<{ children?: React.ReactNode }> {}
  export class Pattern extends Component<SvgProps> {}
  export class Mask extends Component<SvgProps> {}
  export class Marker extends Component<SvgProps> {}
  export class ForeignObject extends Component<SvgProps> {}

  export function SvgXml(props: SvgProps & { xml: string }): JSX.Element;
  export function SvgUri(props: SvgProps & { uri: string }): JSX.Element;
}
