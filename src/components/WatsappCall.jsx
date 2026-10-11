const WhatsappCall = ({ message }) => {
    const whatsappNumber = '9445071614'; 
    const phoneNumber = '+919445071614'; 
    const whatsappLink = `https://wa.me/${whatsappNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    const callLink = `tel:${phoneNumber}`;
    return (
        <div
            className="whatsapp-call-fixed"
            style={{
                position: 'fixed',
                right: 20,
                bottom: 80,
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                background: 'white',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                padding: 12,
            }}
            title="Chat or call with a real human (no bots!)"
        >
            <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-link"
                style={{
                    textDecoration: 'none',
                    color: '#25D366',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                }}
                title="Chat with Human (we promise, no bots!)"
            >
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                    loading="lazy" alt="premium quality cocopeat WhatsApp"
                    style={{ width: 24, height: 24, marginRight: 8 }}
                    className="whatsapp-icon"
                />
                <span className="whatsapp-text">Chat on WhatsApp</span>
            </a>
            <a
                href={callLink}
                className="call-link"
                style={{
                    textDecoration: 'none',
                    color: '#075E54',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                }}
                title="Talk to Human (real, friendly, and coffee-powered)"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="#075E54"
                    viewBox="0 0 24 24"
                    style={{ marginRight: 8 }}
                    className="call-icon"
                >
                    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1v3.5a1 1 0 01-1 1C10.07 22 2 13.93 2 4.5a1 1 0 011-1H6.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z"/>
                </svg>
                <span className="call-text">Call Now</span>
            </a>
            <style>
                {`
                @media (max-width: 700px) {
                    .whatsapp-call-fixed {
                        background: none !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                        gap: 10px !important;
                    }
                    .whatsapp-link, .call-link {
                        background: none !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                        font-weight: normal !important;
                    }
                    .whatsapp-text, .call-text {
                        display: none !important;
                    }
                }
                `}
            </style>
        </div>
    );
};

export default WhatsappCall;