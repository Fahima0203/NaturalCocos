import '../styles/FooterContact.css'
import { Container, Row, Col } from 'react-grid-system';
import visa from '../assets/visa.png'
import paypal from '../assets/paypal.webp'
import mastercard from '../assets/mastercard.png'
import {AccessTime, LocationOn, Facebook, YouTube, X, Instagram, LinkedIn, WhatsApp, Telegram } from '@mui/icons-material';

const quickLinkStyle = {
    textDecoration: "none",
    cursor: "pointer"
};

function FooterContact() {
    return (
        <footer>
            <div className="container">
                <div className="row row-40 row-md-50 justify-content-xl-between">
                    <div className="col-sm-6 col-lg-4 wow fadeInRight" style={{ padding: '10px' }}>
                        <h2>Visit Us</h2>
                        <p style={quickLinkStyle}> 
                            <a target="_blank" rel="noreferrer" href="https://www.google.com/maps/place/NATURAL+COCOS/@11.6702021,78.0800378,17z/data=!3m1!4b1!4m6!3m5!1s0x3babfb00342cac0f:0x4315726befb96990!8m2!3d11.6702021!4d78.0800378!16s%2Fg%2F11xwbjf_34?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D">
                            {/* <LocationOn /> 33/1,2,3, Dharmanagar 3rd Street,<br /> Suramangalam, Salem-636005, <br />Tamil Nadu, India</a></p> */}
                            <LocationOn /> 4, Steel Plant Road,<br /> Talaopatti, Salem, <br />Tamil Nadu-636302, India</a></p>
                        <div style={{ marginTop: '10px' }}>
                            <h4>Business Hours</h4>
                            <ul style={{ listStyle: 'none', paddingLeft: 0, marginBottom: 0 }}>
                                <li><AccessTime /> Open 24/7 – We're always available!</li>
                                <li>Monday - Sunday: 24 Hours</li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-sm-6 col-lg-4" style={{ padding: '10px' }}>
                        <h2>Quick links</h2>
                        <Container>
                            <Row>
                                <Col>
                                    <li>
                                        <span style={quickLinkStyle} onClick={e => { e.preventDefault(); window.history.back(); }}>
                                            History
                                        </span>
                                    </li>
                                    <li><a href="/" style={quickLinkStyle}>Home</a></li>
                                    <li><a href="/products" style={quickLinkStyle}>Products</a></li>
                                    <li><a href="/whyus" style={quickLinkStyle}>Why Us?</a></li>
                                    <li><a href="/aboutus" style={quickLinkStyle}>About Us</a></li>
                                    <li><a href="/contact" style={quickLinkStyle}>Contact</a></li>
                                    <li><a href="/cart" style={quickLinkStyle}>Cart</a></li>
                                    <li><a href="/order-history" style={quickLinkStyle}>Orders</a></li>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                    <div className="col-lg-4 wow fadeInRight" data-wow-delay=".3s" style={{ paddingTop: '10px' }}>
                        <h2>Get in touch</h2>
                        <p>We are always ready to answer any questions you may have or help you select healthy products.</p>
                        <p>Contact us anytime!</p>
                        <div className="gst-iec-box">
                            <span style={{marginRight: 8}}>
                                <svg width="22" height="22" fill="none" stroke="#43a047" strokeWidth="2" style={{marginBottom: -4}}>
                                    <rect x="3" y="5" width="16" height="12" rx="3" />
                                    <line x1="7" y1="9" x2="15" y2="9" />
                                    <line x1="7" y1="13" x2="15" y2="13" />
                                </svg>
                            </span>
                            <a
                                href="/AboutUs#certifications"
                                style={{marginLeft: 8, cursor: "pointer"}}
                            >
                                GSTIN: <span>33EGCPA9831H1ZL</span>
                            </a>
                            <br />
                            <a
                                href="/AboutUs#certifications"
                                style={{marginLeft: 8,cursor: "pointer"}}
                            >
                                IEC: <span>AEKPH7496H</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row row-10 row-sm-30 align-items-center justify-content-sm-between">
                <div className="col-sm-auto col-lg-4 text-lg-left">
                    <div className="group-xs group-middle fade-in-image">
                        <img src={visa} loading="lazy" alt="premium quality cocopeat" width="50" height="25" style={{ padding: '0px 4px' }} />
                        <img src={mastercard} loading="lazy" alt="premium quality cocopeat" width="50" height="25" style={{ padding: '0px 3px', borderRadius: '3px' }} />
                        <img src={paypal} loading="lazy" alt="premium quality cocopeat" width="50" height="25" style={{ padding: '0px 3px', borderRadius: '2px' }} />
                    </div>
                </div>
                <div className="col-sm-auto col-lg-4" style={{ paddingBottom: '10px' }}>
                    <p style={{margin: "0px 0px 5px 0px"}}>Follow us on</p>
                    <style>
                        {`a { all: unset; }`}
                    </style>
                        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                            <a href="https://www.facebook.com/profile.php?id=61585344706653" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                                <Facebook style={{...quickLinkStyle, height: '30px', width: '30px' }} />
                            </a>
                            <a href="https://www.youtube.com/@NaturalCocos-c9t" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                                <YouTube style={{...quickLinkStyle, height: '30px', width: '30px' }} />
                            </a>
                            <a href="https://x.com/NaturalCocos" aria-label="X" target="_blank" rel="noopener noreferrer">
                                <X style={{...quickLinkStyle, height: '30px', width: '30px' }} />
                            </a>
                            <a href="https://www.instagram.com/natural_cocos_/" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                                <Instagram style={{...quickLinkStyle, height: '30px', width: '30px' }} />
                            </a>
                            <a href="https://www.linkedin.com/" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                                <LinkedIn style={{...quickLinkStyle, height: '30px', width: '30px' }} />
                            </a>
                            <a href="https://www.whatsapp.com/" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
                                <WhatsApp style={{...quickLinkStyle, height: '30px', width: '30px' }} />
                            </a>
                            <a href="https://www.telegram.org/" aria-label="Telegram" target="_blank" rel="noopener noreferrer">
                                <Telegram style={{...quickLinkStyle, height: '30px', width: '30px' }} />
                            </a>
                    </div>
                </div>
                <div className="col-lg-4 ">
                    <p className="rights">
                        <span>©&nbsp; </span>
                        <span className="copyright-year">2025</span>
                        <span>&nbsp;</span><span>Natural Cocos</span>
                        <span>.&nbsp; All rights reserved.</span>
                        <span>&nbsp;</span>
                        {/* <h4 href="privacy-policy.html">Privacy Policy</h4> */}
                    </p>
                </div>
            </div>
        </footer >
    )
}

export default FooterContact