<a href="https://rerousel.netlify.app/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/aexol-studio/rerousel-react-carousel/blob/ffa8b18fb54751bc09377eedbb72d29f29c8e6ee/src/__sandbox__/assets/images/RerouselLogoDark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/aexol-studio/rerousel-react-carousel/blob/ffa8b18fb54751bc09377eedbb72d29f29c8e6ee/src/__sandbox__/assets/images/RerouselLogoLight.svg">
  <img alt="Rerousel">    
</picture>
</a>

[![npm](https://img.shields.io/npm/v/rerousel.svg?style=flat-square)](https://www.npmjs.com/package/rerousel) [ ![npm downloads](https://img.shields.io/npm/dt/rerousel.svg?style=flat-square)](https://www.npmjs.com/package/rerousel)

### Rerousel - the simplest and lightest infinite carousel package made for React.
 - Simple: Need a carousel component for your website or app? Tired of looking for something decent on Codepen? With Rerousel you can set it up in the blink of an eye!
 - Lightweight: Rerousel is the lightest infinite React carousel available for download from NPM because it uses only a couple of vital packages. You don’t have to worry about thousands of dependencies flooding your application!
 - Versatile: Whether you want to show off your products, brag with customer reviews, or even set up a collage of holiday pictures - Rerousel is there for you.
It supports all types of JSX elements, so you don't have to worry about compatibility. It doesn't have to be an infinite carousel - you can simply set up a custom stop point using the `stop` prop.

## Table of contents

-   [Live demo](#live-demo)
-   [How to use?](#how-to-use)
-   [Props](#props)
-   [Contribute](#contribute)
-   [Issues](#issues)

## Live demo

You can play around with Rerousel sandbox by checking out [the live demo here](https://rerousel.netlify.app/)

## How to use?

1. Install the package using this npm command:

```
npm install rerousel
```

2. Import Rerousel at the top of the component you want to use it in:

```tsx
import { Rerousel } from 'rerousel';
```

3. Place it in the desired position in the html tree and fill it with the items you want to showcase

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

4. Create a ref pointing to your outermost item inside of the Rerousel and include it in Rerousel as an `itemRef` prop.
   You can also determine the interval using the `interval` prop in **milliseconds**, but you don't have to - the default value is **3 seconds**.

## Props

| Prop         | Type                     | Default     | Required? | Description                                                                                   |
| ------------ | ------------------------ | ----------- | --------- | --------------------------------------------------------------------------------------------- |
| **itemRef**  | _RefObject<HTMLElement>_ | `undefined` | Yes       | Reference to the outermost item of the carousel - used to retrieve information about the item's total width |
| **interval** | _Number_                 | `3000`      | No        | Interval length in milliseconds                                                               |
| **stop**     | _Boolean_                | `false`     | No        | Should the carousel stop?                                                                     |

## Contribute

1.  Fork this repo
2.  Create your feature branch: git checkout -b feature-name
3.  Commit your changes: git commit -am 'Add some feature'
4.  Push to the branch: git push origin my-new-feature
5.  Submit a pull request

## Issues

If you encounter any issues when using the **Rerousel** package, please add a new issue - we will get to it as fast as it's possible.
