// import React from 'react';

// const MainComponent = () => {
//     const nr = Math.random();

//     return (
//         <div>
//             <span>text content</span>
//             <SubComponent />
//             <ShortComponent />
//         </div>
//     )
// }

// function SubComponent() {

}

export const WrapperComponent = () => {
    const props = { someValue: true };

    return <MainComponent {...props} />
}

const ShortComponent = () => <div>i am short</div>