import "./HomeSections.css";

import HeroSection from "../../components/home/HeroSection";
import RoleSection from "../../components/home/RoleSection";
import FeaturesSection from "../../components/home/FeaturesSection";
import ProcessSection from "../../components/home/ProcessSection";
import CTASection from "../../components/home/CTASection";

function Home() {
    return (
        <div className="home">

            <HeroSection />

            <RoleSection />

            <FeaturesSection />

            <ProcessSection />

            <CTASection />

        </div>
    );
}

export default Home;