![enter image description here](https://svgshare.com/i/TQU.svg)

[![npm](https://img.shields.io/npm/v/rerousel.svg?style=flat-square)](https://www.npmjs.com/package/graphql-editor) [ ![npm downloads](https://img.shields.io/npm/dt/rerousel.svg?style=flat-square)](https://www.npmjs.com/package/rerousel)

### Rerousel is the simplest and the lightest infinite carousel package made for React.

### Simple

Set up your carousel in the blink of an eye. You only have to install the package - the component setup is effortless!

### Lightweight

Rerousel is the lightest working infinite react carousel available to download from the NPM, using only the packages that are necessary. You don’t have to worry about thousands of dependencies flooding your application!

### Versatile

Either you want to show off your products, customers or even holiday pictures - Rerousel is there for you.
It supports all types of JSX elements, so you don't have to worry about compatibility.

## Table of contents

-   [How to use?](#how-to-use)

## How to use?

1. Install the package using npm

```
npm install rerousel
```

2. Import rerousel in the component you want to use it

```tsx
import { Rerousel } from 'rerousel';
```

3. Place it in the desired position and fill it with the items you want to showcase

```tsx
export const Component: React.FC<CustomersProps> = ({ customers }) => {
    const customerLogo = useRef(null);

    return (
        <Container>
            <Rerousel itemRef={customerLogo}>
                {customers.map((c) => {
                    return <Img key={c.image} image={c.image} ref={customerLogo} />;
                })}
            </Rerousel>
        </Container>
    );
};
```

4. Create a ref pointing at your outermost item inside of the rerousel and include it in the Rerousel as **"itemRef"** prop.
