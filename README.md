# react-lowrender ⚡️

An ultra-lightweight React library that optimizes performance by rendering complex components as static HTML and only hydrating them into interactive React components on hover. 

Ideal for heavy lists, data grids, or dashboards where rendering hundreds of interactive components at once would freeze the browser.

## Installation

```bash
npm install react-lowrender
# or
pnpm add react-lowrender
# or
yarn add react-lowrender
```

## Features

- **🚀 Instant Initial Render**: Converts your heavy React components into pure, lightweight HTML.
- **💧 Deferred Hydration**: Components become fully interactive automatically when the user hovers over them.
- **✨ Zero Layout Shifts**: Smooth transition from static HTML to React components.
- **📦 Tiny Bundle Size**: Under 1KB (minified + gzipped).

## Usage

Here is a basic example of how to use the `useStaticRender` hook.

```tsx
import React from 'react';
import { useStaticRender } from 'react-lowrender';
import HeavyComponent from './HeavyComponent';

export default function MyList() {
  const items = Array.from({ length: 300 }, (_, i) => `Item #${i + 1}`);

  // 1. Pass the base element you want to optimize
  const { StaticItem } = useStaticRender(
    <HeavyComponent color="primary">
      {/* Dynamic text will be injected via children */}
    </HeavyComponent>,
    { hydrationDelay: 50 } // optional
  );

  return (
    <div className="list-container">
      {items.map((text, index) => (
        // 2. Use the generated StaticItem instead of your HeavyComponent
        <StaticItem key={index}>
          {text}
        </StaticItem>
      ))}
    </div>
  );
}
```

## API Reference

### `useStaticRender(baseElement, options?)`

#### Parameters

- `baseElement` (`ReactElement`): The React element you want to render statically. The text content inside it will be dynamically replaced by the `children` passed to the `StaticItem`.
- `options` (`StaticRenderOptions`): Optional configuration.
  - `hydrationDelay` (`number`): The delay in milliseconds before hydration (replacement with the interactive component) occurs after the user hovers over the element. Default is `30`.

#### Returns

Returns an object containing:
- `StaticItem` (`React.FC<StaticItemProps>`): A highly optimized component that renders pure HTML and handles its own asynchronous hydration.

### `StaticItemProps`

Accepts all standard HTML attributes for a `div` element (`className`, `style`, etc.), plus:
- `children` (`string`): The text content to be inserted into the static element. Currently only supports strings for maximum performance.

## Playground / Local Development

If you want to contribute or play around with the library locally:

1. Clone the repository.
2. Run `pnpm install`.
3. Open `playground/App.tsx` and import your test components.
4. Run `pnpm run dev` to start the local Vite server.

## License

MIT
