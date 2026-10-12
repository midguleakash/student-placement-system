import "./HomeSections.css";

import HeroSection from "../../components/home/HeroSection";
import RoleSection from "../../components/home/RoleSection";
import FeaturesSection from "../../components/home/FeaturesSection";
import ProcessSection from "../../components/home/ProcessSection";
import CTASection from "../../components/home/CTASection";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";



function Home() {
    return (
        <div className="home">
            <Navbar />

            <HeroSection />

            <RoleSection />

            <FeaturesSection />

            <ProcessSection />

            <CTASection />

            <Footer />

        </div>
    );
}

export default Home;