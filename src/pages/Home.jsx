import { RunningBadge } from "../pages/About";
import HomeSlideshow from "../components/HomeSlideshow";
import FeaturedProducts from "../components/FeaturedProducts";
import HomeSlider from "../components/HomeSlider";
import FooterContact from "../components/FooterContact";
import AboutTab from "../components/AboutTab";
import TrustStrip from "../components/TrustStrip";
import FAQ from "../components/FAQ";
import TestimonialsSection from "../components/TestimonialsSection";

const Home = () => {

    return (
        <div>
            <RunningBadge />
            <HomeSlideshow />
            <TrustStrip />
            <FeaturedProducts />
            <HomeSlider />
            <AboutTab />
            <TestimonialsSection />
            <FAQ />
            <FooterContact />
        </div>
    );
};

export default Home;