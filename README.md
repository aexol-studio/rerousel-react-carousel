[![Rerousel logo](https://svgshare.com/i/TUi.svg)](https://rerousel.netlify.app/)

![Rerousel gif](https://s2.gifyu.com/images/rerousel3.gif)

[![npm](https://img.shields.io/npm/v/rerousel.svg?style=flat-square)](https://www.npmjs.com/package/rerousel) [ ![npm downloads](https://img.shields.io/npm/dt/rerousel.svg?style=flat-square)](https://www.npmjs.com/package/rerousel)

### Rerousel is the simplest and the lightest infinite carousel package made for React.

### Simple

Set up your carousel in the blink of an eye. You only have to install the package - the component setup is effortless!

### Lightweight

Rerousel is the lightest working infinite react carousel available to download from the NPM, using only the packages that are necessary. You don’t have to worry about thousands of dependencies flooding your application!

### Versatile

Either you want to show off your products, customers or even holiday pictures - Rerousel is there for you.
It supports all types of JSX elements, so you don't have to worry about compatibility.

## Table of contents

-   [Live demo](#live-demo)
-   [How to use?](#how-to-use)
-   [Props](#props)
-   [Contribute](#contribute)
-   [Issues](#issues)

## Live demo

You can check out the Rerousel sandbox [HERE](https://rerousel.netlify.app/)

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
   You can also determine the interval using **"interval"** prop in **milliseconds**, but you don't have to - default value is **3 seconds**.

## Props

| Prop         | Type                     | Default     | Required? | Description                                                                                   |
| ------------ | ------------------------ | ----------- | --------- | --------------------------------------------------------------------------------------------- |
| **itemRef**  | _RefObject<HTMLElement>_ | `undefined` | Yes       | Reference to the outermost item of carousel - used to retrieve information about item's width |
| **interval** | _Number_                 | `3000`      | No        | Interval length in milliseconds                                                               |
| **stop**     | _Boolean_                | `false`     | No        | Should the carousel stop?                                                                     |

## Contribute

1.  Fork this repo
2.  Create your feature branch: git checkout -b feature-name
3.  Commit your changes: git commit -am 'Add some feature'
4.  Push to the branch: git push origin my-new-feature
5.  Submit a pull request

## Example - testimonials carousel

![Testimonials](https://s2.gifyu.com/images/rerousel-example.gif)

## Issues

If you encounter any issues when using **Rerousel** package, please add a new issue - we will get to it as fast as it's possible.
