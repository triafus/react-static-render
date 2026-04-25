import React, {
  ReactElement,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";

const SLOT_MARKER = "___SLOT_MARKER___";

export interface StaticRenderOptions {
  /**
   * The delay (in milliseconds) before hydration (replacement with the interactive component) on hover.
   * @default 30
   */
  hydrationDelay?: number;
  /**
   * Whether to apply `display: contents` to the static wrapper `div` to prevent layout shifts.
   * @default true
   */
  displayContents?: boolean;
}

export type StaticItemProps<P> = P & {
  /**
   * The text content to be inserted into the static element.
   * Only supports strings to ensure fast HTML insertion.
   */
  children: string;
};

/**
 * Generates an ultra-lightweight static version of a React component, with asynchronous hydration on hover.
 *
 * This hook takes a base element and converts it into an HTML string (`prototypeMarkup`).
 * It returns a `StaticItem` component that directly displays this HTML for high performance.
 * On hover (`onMouseEnter`), the element is hydrated with the actual interactive React component.
 *
 * @param baseElement The base React element to render statically (e.g., `<Button variant="contained" />`).
 * @param options Configuration options for static rendering.
 * @returns An object containing the `StaticItem` component to be used in lists.
 */
export const useStaticRender = <P extends object>(
  baseElement: ReactElement<P>,
  options: StaticRenderOptions = {},
) => {
  const { hydrationDelay = 30, displayContents = true } = options;

  // 1. Compute markup (cached by baseElement props)
  const prototypeMarkup = useMemo(() => {
    const props = baseElement.props;
    const propsWithChildren = props as Record<string, unknown>;
    const template = React.cloneElement(
      baseElement,
      props,
      (propsWithChildren.children as React.ReactNode) || SLOT_MARKER,
    );
    return renderToStaticMarkup(template);
  }, [baseElement]);

  // 2. Bridge dynamic values to the stable component via Ref
  const stateRef = useRef({
    baseElement,
    prototypeMarkup,
    hydrationDelay,
    displayContents,
  });

  useEffect(() => {
    stateRef.current = {
      baseElement,
      prototypeMarkup,
      hydrationDelay,
      displayContents,
    };
  }, [baseElement, prototypeMarkup, hydrationDelay, displayContents]);

  // 3. STABLE COMPONENT TYPE: This must NEVER change to preserve [isInteractive] state
  const StaticItem = useMemo(() => {
    const Item = ({ children, ...componentProps }: StaticItemProps<P>) => {
      const [isInteractive, setIsInteractive] = useState<boolean>(false);
      const [needsFocus, setNeedsFocus] = useState<boolean>(false);
      const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
      const wrapperRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        return () => {
          if (timerRef.current) clearTimeout(timerRef.current);
        };
      }, []);

      // RGAA: Restore focus after hydration
      useEffect(() => {
        if (isInteractive && needsFocus && wrapperRef.current) {
          const focusableChild = wrapperRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ) as HTMLElement;

          if (focusableChild) {
            focusableChild.focus();
          } else if (wrapperRef.current.firstElementChild) {
            (wrapperRef.current.firstElementChild as HTMLElement).focus();
          }
          setNeedsFocus(false);
        }
      }, [isInteractive, needsFocus]);

      const handleInteract = (
        e: React.MouseEvent<HTMLDivElement> | React.FocusEvent<HTMLDivElement>,
        isFocus: boolean = false,
      ) => {
        // IMPORTANT: If already interactive or hydrating, do nothing
        if (isInteractive || timerRef.current) return;

        const { hydrationDelay: currentDelay } = stateRef.current;
        const delay = isFocus ? 0 : currentDelay;

        timerRef.current = setTimeout(() => {
          setIsInteractive(true);
          if (isFocus) setNeedsFocus(true);
        }, delay);

        if (!isFocus) {
          const props = componentProps as Partial<
            React.DOMAttributes<HTMLElement>
          >;
          if (typeof props.onMouseEnter === "function") {
            props.onMouseEnter(e as unknown as React.MouseEvent<HTMLElement>);
          }
        }
      };

      const handleLeave = (
        e: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>,
        isBlur: boolean = false,
      ) => {
        // Only dehydrate on blur if focus actually left the wrapper (e.g., tabbing away)
        if (isBlur) {
          const focusEvent = e as React.FocusEvent<HTMLElement>;
          if (
            wrapperRef.current &&
            wrapperRef.current.contains(focusEvent.relatedTarget as Node)
          ) {
            return; // Focus just moved inside the wrapper
          }
        }

        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        setIsInteractive(false);

        if (!isBlur) {
          const props = componentProps as Partial<
            React.DOMAttributes<HTMLElement>
          >;
          if (typeof props.onMouseLeave === "function") {
            props.onMouseLeave(e as unknown as React.MouseEvent<HTMLElement>);
          }
        }
      };

      const {
        prototypeMarkup: currentMarkup,
        displayContents: currentDisplay,
        baseElement: currentBase,
      } = stateRef.current;

      const wrapperStyle = { display: currentDisplay ? "contents" : undefined };

      if (isInteractive) {
        return (
          <div
            ref={wrapperRef}
            style={wrapperStyle}
            onMouseLeave={(e) => handleLeave(e, false)}
            onBlur={(e) => handleLeave(e, true)}
          >
            {React.cloneElement(
              currentBase,
              {
                ...currentBase.props,
                ...componentProps,
              },
              children,
            )}
          </div>
        );
      }

      return (
        <div
          ref={wrapperRef}
          onMouseEnter={(e) => handleInteract(e, false)}
          onMouseLeave={(e) => handleLeave(e, false)}
          onFocus={(e) => handleInteract(e, true)}
          onBlur={(e) => handleLeave(e, true)}
          style={wrapperStyle}
          dangerouslySetInnerHTML={{
            __html: currentMarkup.replace(SLOT_MARKER, children),
          }}
        />
      );
    };

    Item.displayName = "StaticItem";
    return Item;
  }, []);

  return { StaticItem };
};
