declare module 'react' {
 
  declare namespace React {
    type ReactNode = string | number | boolean | null | undefined | ReactElement | ReactNodeArray;
    interface ReactElement {
      type: any;
      props: any;
      key: any;
    }
    interface ReactNodeArray extends Array<ReactNode> {}
  
    interface FunctionComponent<P = {}> {
      (props: P & { children?: ReactNode }, context?: any): ReactElement | null;
      displayName?: string;
    }
    type FC<P = {}> = FunctionComponent<P>;
  
    function useState<S>(initialState: S | (() => S)): [S, (newState: S | ((prevState: S) => S)) => void];
    function useState<S = undefined>(): [S | undefined, (newState: S | ((prevState: S | undefined) => S | undefined)) => void];
  
    function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  
    function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  
    // JSX 相关类型定义
    interface JSX {
      IntrinsicElements: {
        [elemName: string]: any;
      };
    }
  }
}
declare module 'react-icons/fa' {
  export const FaArrowLeft: any;
  export const FaArrowRight: any;
}