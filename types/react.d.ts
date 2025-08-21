declare module 'react' {
  // 基础类型定义
  type ReactNode = string | number | boolean | null | undefined | ReactElement | ReactNodeArray;
  interface ReactElement {
    type: any;
    props: any;
    key: any;
  }
  interface ReactNodeArray extends Array<ReactNode> {}

  // FC 类型定义
  interface FunctionComponent<P = {}> {
    (props: P & { children?: ReactNode }, context?: any): ReactElement | null;
    displayName?: string;
  }
  type FC<P = {}> = FunctionComponent<P>;

  // useState 类型定义
  function useState<S>(initialState: S | (() => S)): [S, (newState: S | ((prevState: S) => S)) => void];
  function useState<S = undefined>(): [S | undefined, (newState: S | ((prevState: S | undefined) => S | undefined)) => void];

  // useEffect 类型定义
  function useEffect(effect: () => void | (() => void), deps?: any[]): void;

  // useCallback 类型定义
  function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
}
declare module 'react-icons/fa' {
  export const FaArrowLeft: any;
  export const FaArrowRight: any;
}