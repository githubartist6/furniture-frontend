import React from "react";

import Heros from "../Components/Hero/Heros";
import FurnitureModes from "../Components/FurnitureModes/FurnitureModes";
import ProductShowcase from "../Components/ProductShowcase/ProductShowcase";

const Home = () => {
    return (
        <>
            <Heros />
            <FurnitureModes />
            <ProductShowcase />
            {/* <Shop /> */}
        </>
    );
};

export default Home;