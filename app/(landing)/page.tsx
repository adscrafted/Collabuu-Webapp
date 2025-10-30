'use client';

import Script from 'next/script';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

export default function LandingPage() {
  const hasSelectedAudienceRef = useRef(false);

  useEffect(() => {
    // Setup navbar scroll effect
    const navbar = document.getElementById('navbar');
    const heroSection = document.querySelector('.hero-landing');

    if (!navbar || !heroSection) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Handle navbar light/dark mode
      if (scrollY > 100) {
        navbar.classList.add('light-mode');
        document.body.classList.add('scrolled-past-hero');
      } else {
        navbar.classList.remove('light-mode');
        document.body.classList.remove('scrolled-past-hero');
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Call once to set initial state
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Audience selector functionality
    const mainTabButtons = document.querySelectorAll('.main-tab-btn');
    const audienceExperiences = document.querySelectorAll('.audience-experience');
    const dynamicContent = document.getElementById('dynamic-content');
    const navDynamicItems = document.querySelectorAll('.nav-item-dynamic');
    const navAppStore = document.getElementById('nav-app-store');

    console.log('Setting up audience selector...', {
      buttons: mainTabButtons.length,
      experiences: audienceExperiences.length,
      dynamicContent: !!dynamicContent
    });

    const showNavigationItems = (audience: string) => {
      // Always show Features, How It Works, Get App links
      navDynamicItems.forEach(item => {
        item.classList.remove('nav-item-hidden');
        item.classList.add('nav-item-visible');
      });

      // Get login button
      const loginButton = document.querySelector('.btn-login');

      if (audience === 'influencers' || audience === 'customers') {
        // Influencers/Customers: Show App Store, hide Login
        if (navAppStore) {
          navAppStore.classList.remove('nav-item-hidden');
          navAppStore.classList.add('nav-item-visible');
        }
        if (loginButton) {
          loginButton.classList.add('nav-item-hidden');
          loginButton.classList.remove('nav-item-visible');
        }
      } else {
        // Businesses: Show both Login AND Get App (App Store button)
        if (navAppStore) {
          navAppStore.classList.remove('nav-item-hidden');
          navAppStore.classList.add('nav-item-visible');
        }
        if (loginButton) {
          loginButton.classList.remove('nav-item-hidden');
          loginButton.classList.add('nav-item-visible');
        }
      }
    };

    mainTabButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const targetAudience = button.getAttribute('data-audience');
        console.log('Audience button clicked:', targetAudience);

        // Remove active class from all tabs and experiences
        mainTabButtons.forEach(btn => btn.classList.remove('active'));
        audienceExperiences.forEach(exp => exp.classList.remove('active'));

        // Add active class to clicked button and corresponding experience
        button.classList.add('active');
        const targetExperience = document.getElementById(`${targetAudience}-experience`);
        if (targetExperience) {
          targetExperience.classList.add('active');
        }

        // Show dynamic content area
        if (dynamicContent && dynamicContent.classList.contains('hidden')) {
          dynamicContent.classList.remove('hidden');
        }

        // Mark that user has selected an audience
        hasSelectedAudienceRef.current = true;
        showNavigationItems(targetAudience || '');

        // Scroll to the first section
        const firstSection = targetExperience?.querySelector('.features-section');
        if (firstSection) {
          firstSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }, []);

  return (
    <div>
        {/* Navigation */}
        <nav className="navbar" id="navbar">
          <div className="nav-container">
            <div className="nav-brand">
              <a
                href="#top"
                className="logo-wrapper"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <span className="logo-text">Collabuu</span>
              </a>
            </div>

            <div className="nav-menu" id="navMenu">
              <ul className="nav-links">
                <li className="nav-item-dynamic nav-item-hidden"><a href="#features" className="nav-link">Features</a></li>
                <li className="nav-item-dynamic nav-item-hidden"><a href="#how-it-works" className="nav-link">How It Works</a></li>
                <li className="nav-item-dynamic nav-item-hidden"><a href="#download" className="nav-link">Get App</a></li>
              </ul>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="mobile-menu-toggle" id="mobileMenuToggle">
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </div>

            <div className="nav-cta">
              <a href="/login" className="btn btn-login">Login</a>
              <a href="#download" className="btn btn-app-store nav-item-hidden" id="nav-app-store">App Store</a>
            </div>
          </div>
        </nav>

        {/* Hero Landing Section */}
        <section className="hero-landing" id="hero">
          <div className="geometric-background">
            <div className="geometric-shape shape-1"></div>
            <div className="geometric-shape shape-2"></div>
            <div className="geometric-shape shape-3"></div>
            <div className="geometric-shape shape-4"></div>
            <div className="geometric-shape shape-5"></div>
            <div className="geometric-shape shape-6"></div>
          </div>

          <div className="hero-container">
            <div className="hero-content">
              {/* Main Title */}
              <div className="main-title">
                <h1>
                  <span className="title-word">Connect</span>
                  <span className="title-word">Collaborate</span>
                  <span className="title-word">& Grow</span>
                </h1>
                <div className="title-accent">
                  <span className="accent-dot"></span>
                </div>
              </div>

              {/* App Store Button */}
              <div className="app-store-buttons">
                <a href="#" className="store-btn app-store">
                  <svg className="store-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.13997 6.91 8.85997 6.88C10.15 6.85 11.36 7.72 12.11 7.72C12.86 7.72 14.28 6.68 15.84 6.84C16.41 6.87 18.05 7.1 19.05 8.82C18.95 8.89 17.06 10.1 17.08 12.4C17.1 15.24 19.56 16.2 19.58 16.21C19.54 16.3 19.12 17.74 18.71 19.5Z" fill="currentColor"/>
                    <path d="M13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" fill="currentColor"/>
                  </svg>
                </a>
              </div>

              {/* Hero CTA */}
              <div className="hero-cta">
                <p className="cta-text">Ready to get started?</p>
                <a href="#audience-selector" className="cta-button">
                  <span>Choose Your Path</span>
                  <svg className="cta-arrow" viewBox="0 0 24 24" fill="none">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Main Audience Selection */}
        <section id="audience-selector" className="audience-selector-section">
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title">Choose Your Experience</h2>
              <p className="section-subtitle">Tell us who you are and we'll personalize everything for you</p>
            </div>

            <div className="main-audience-tabs">
              <button className="main-tab-btn" data-audience="businesses">
                <div className="tab-icon">
                  <img src="/landing/images/business-icon.png" alt="Business" width="64" height="64" className="tab-icon-img" />
                </div>
                <div className="tab-content">
                  <h3>For Businesses</h3>
                  <p>Launch campaigns and grow sales</p>
                </div>
              </button>
              <button className="main-tab-btn" data-audience="influencers">
                <div className="tab-icon">
                  <img src="/landing/images/influencer-icon.png" alt="Influencer" width="64" height="64" className="tab-icon-img" />
                </div>
                <div className="tab-content">
                  <h3>For Influencers</h3>
                  <p>Monetize your influence</p>
                </div>
              </button>
              <button className="main-tab-btn" data-audience="customers">
                <div className="tab-icon">
                  <img src="/landing/images/customer-icon.png" alt="Customer" width="64" height="64" className="tab-icon-img" />
                </div>
                <div className="tab-content">
                  <h3>For Customers</h3>
                  <p>Discover deals and earn rewards</p>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Dynamic Content Area */}
        <div className="dynamic-content hidden" id="dynamic-content">
          {/* Businesses Content */}
          <div className="audience-experience" id="businesses-experience">
            {/* Features Section for Businesses */}
            <section id="features" className="features-section">
              <div className="section-container">
                <div className="section-header">
                  <h2 className="section-title">🔥 Features for Businesses</h2>
                  <p className="section-subtitle">Supercharge Your Product Launches with Verified Influencer-Driven Sales</p>
                </div>
                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-visual">
                      <div className="feature-icon">
                        <img src="/landing/images/money.png" alt="Money" width="48" height="48" className="feature-icon-img" />
                      </div>
                    </div>
                    <div className="feature-content">
                      <h3>Only Pay for Real Customers</h3>
                      <p>Don't pay for likes or followers—pay only for verified in-store or online visits driven by influencer QR codes.</p>
                    </div>
                  </div>

                  <div className="feature-card">
                    <div className="feature-visual">
                      <div className="feature-icon">
                        <img src="/landing/images/rocket.png" alt="Rocket" width="48" height="48" className="feature-icon-img" />
                      </div>
                    </div>
                    <div className="feature-content">
                      <h3>Launch Campaigns in Minutes</h3>
                      <p>Post your campaign details, fund it with tokens, and watch influencers apply to promote your brand.</p>
                    </div>
                  </div>

                  <div className="feature-card">
                    <div className="feature-visual">
                      <div className="feature-icon">
                        <img src="/landing/images/data-analytics.png" alt="Data Analytics" width="48" height="48" className="feature-icon-img" />
                      </div>
                    </div>
                    <div className="feature-content">
                      <h3>Precision Matchmaking</h3>
                      <p>Choose from a pool of influencers aligned with your niche, location, and audience.</p>
                    </div>
                  </div>

                  <div className="feature-card">
                    <div className="feature-visual">
                      <div className="feature-icon">
                        <img src="/landing/images/star.png" alt="Star" width="48" height="48" className="feature-icon-img" />
                      </div>
                    </div>
                    <div className="feature-content">
                      <h3>Trackable ROI</h3>
                      <p>Every scanned QR code is tracked to a specific influencer, giving you clear customer attribution.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How It Works for Businesses */}
            <section id="how-it-works" className="how-it-works-section">
              <div className="section-container">
                <div className="section-header">
                  <h2 className="section-title">🟢 How It Works</h2>
                  <p className="section-subtitle">Simple 3-step process for businesses</p>
                </div>
                <div className="steps-container">
                  <div className="step-card">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h3>Launch a Campaign</h3>
                      <p>Set your offer, budget in tokens, and campaign goals.</p>
                    </div>
                  </div>

                  <div className="step-card">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h3>Choose Your Influencers</h3>
                      <p>Browse applicants and pick the creators that match your brand.</p>
                    </div>
                  </div>

                  <div className="step-card">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h3>Pay for Verified Customers</h3>
                      <p>Only pay when someone walks in, scans the QR, and redeems the deal.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Tokenomics Section for Businesses */}
            <section id="tokenomics" className="tokenomics-section">
              <div className="section-container">
                <div className="section-header">
                  <h2 className="section-title">Choose Your Token Pack</h2>
                  <p className="section-subtitle">Power your campaigns with our flexible token system</p>
                </div>

                <div className="pricing-grid">
                  <div className="pricing-card starter">
                    <div className="card-header">
                      <h3>Starter Pack</h3>
                      <div className="price">
                        <span className="currency">$</span>
                        <span className="amount">99</span>
                      </div>
                      <div className="tokens">
                        <span className="token-count">1,000</span>
                        <span className="token-label">Tokens</span>
                      </div>
                    </div>
                    <div className="card-features">
                      <div className="feature-item">
                        <span className="check">✓</span>
                        <span>Up to 1,000 customer visits</span>
                      </div>
                      <div className="feature-item">
                        <span className="check">✓</span>
                        <span>Basic analytics dashboard</span>
                      </div>
                      <div className="feature-item">
                        <span className="check">✓</span>
                        <span>QR code generation</span>
                      </div>
                    </div>
                    <button className="btn btn-card">Get Started</button>
                  </div>

                  <div className="pricing-card business popular">
                    <div className="popular-badge">Most Popular</div>
                    <div className="card-header">
                      <h3>Business Pack</h3>
                      <div className="price">
                        <span className="currency">$</span>
                        <span className="amount">299</span>
                      </div>
                      <div className="tokens">
                        <span className="token-count">3,500</span>
                        <span className="token-label">Tokens</span>
                      </div>
                    </div>
                    <div className="card-features">
                      <div className="feature-item">
                        <span className="check">✓</span>
                        <span>Up to 3,500 customer visits</span>
                      </div>
                      <div className="feature-item">
                        <span className="check">✓</span>
                        <span>Advanced analytics & insights</span>
                      </div>
                      <div className="feature-item">
                        <span className="check">✓</span>
                        <span>Multiple campaign types</span>
                      </div>
                    </div>
                    <button className="btn btn-card btn-primary">Choose Plan</button>
                  </div>

                  <div className="pricing-card enterprise">
                    <div className="card-header">
                      <h3>Enterprise Pack</h3>
                      <div className="price">
                        <span className="currency">$</span>
                        <span className="amount">799</span>
                      </div>
                      <div className="tokens">
                        <span className="token-count">10,000</span>
                        <span className="token-label">Tokens</span>
                      </div>
                    </div>
                    <div className="card-features">
                      <div className="feature-item">
                        <span className="check">✓</span>
                        <span>Up to 10,000 customer visits</span>
                      </div>
                      <div className="feature-item">
                        <span className="check">✓</span>
                        <span>Premium analytics suite</span>
                      </div>
                      <div className="feature-item">
                        <span className="check">✓</span>
                        <span>API access & integrations</span>
                      </div>
                    </div>
                    <button className="btn btn-card">Contact Sales</button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Influencers Content */}
          <div className="audience-experience" id="influencers-experience">
            {/* Features Section for Influencers */}
            <section className="features-section">
              <div className="section-container">
                <div className="section-header">
                  <h2 className="section-title">🎥 Features for Influencers</h2>
                  <p className="section-subtitle">Earn Based on Results—Not Reach</p>
                </div>
                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-visual">
                      <div className="feature-icon">
                        <img src="/landing/images/money.png" alt="Money" width="48" height="48" className="feature-icon-img" />
                      </div>
                    </div>
                    <div className="feature-content">
                      <h3>Earn Per Verified Customer</h3>
                      <p>The more customers you bring in, the more you earn—no need to negotiate per-post deals.</p>
                    </div>
                  </div>

                  <div className="feature-card">
                    <div className="feature-visual">
                      <div className="feature-icon">
                        <img src="/landing/images/content.png" alt="Content" width="48" height="48" className="feature-icon-img" />
                      </div>
                    </div>
                    <div className="feature-content">
                      <h3>Create Unlimited Content</h3>
                      <p>You're free to promote your way—videos, reels, blogs, or stories—maximize reach, maximize payout.</p>
                    </div>
                  </div>

                  <div className="feature-card">
                    <div className="feature-visual">
                      <div className="feature-icon">
                        <img src="/landing/images/qr-code.png" alt="QR Code" width="48" height="48" className="feature-icon-img" />
                      </div>
                    </div>
                    <div className="feature-content">
                      <h3>One Link, One Code, Infinite Opportunities</h3>
                      <p>Get a unique QR code to promote. Every scan is tracked and rewarded.</p>
                    </div>
                  </div>

                  <div className="feature-card">
                    <div className="feature-visual">
                      <div className="feature-icon">
                        <img src="/landing/images/star.png" alt="Star" width="48" height="48" className="feature-icon-img" />
                      </div>
                    </div>
                    <div className="feature-content">
                      <h3>Work With Brands You Love</h3>
                      <p>Apply to campaigns that fit your vibe, and get rewarded for real influence.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How It Works for Influencers */}
            <section className="how-it-works-section">
              <div className="section-container">
                <div className="section-header">
                  <h2 className="section-title">🟢 How It Works</h2>
                  <p className="section-subtitle">Simple 3-step process for influencers</p>
                </div>
                <div className="steps-container">
                  <div className="step-card">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h3>Apply to Campaigns You Like</h3>
                      <p>Pick campaigns that fit your style and audience.</p>
                    </div>
                  </div>

                  <div className="step-card">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h3>Promote with a Unique QR Code</h3>
                      <p>You get a trackable QR code to include in your content.</p>
                    </div>
                  </div>

                  <div className="step-card">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h3>Earn When Customers Convert</h3>
                      <p>You earn every time your audience redeems a deal at the business.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Customers Content */}
          <div className="audience-experience" id="customers-experience">
            {/* Features Section for Customers */}
            <section className="features-section">
              <div className="section-container">
                <div className="section-header">
                  <h2 className="section-title">👥 Features for Customers</h2>
                  <p className="section-subtitle">Discover Local Deals & Earn Rewards While Supporting Your Favorite Creators</p>
                </div>
                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-visual">
                      <div className="feature-icon">
                        <img src="/landing/images/discount.png" alt="Discount" width="48" height="48" className="feature-icon-img" />
                      </div>
                    </div>
                    <div className="feature-content">
                      <h3>Get Exclusive Discounts</h3>
                      <p>Scan influencer QR codes to access special offers and in-store deals.</p>
                    </div>
                  </div>

                  <div className="feature-card">
                    <div className="feature-visual">
                      <div className="feature-icon">
                        <img src="/landing/images/loyalty-card.png" alt="Loyalty Card" width="48" height="48" className="feature-icon-img" />
                      </div>
                    </div>
                    <div className="feature-content">
                      <h3>Earn Points for Every Visit</h3>
                      <p>Collect reward points with every QR scan—redeem them for free items, experiences, or app-exclusive perks.</p>
                    </div>
                  </div>

                  <div className="feature-card">
                    <div className="feature-visual">
                      <div className="feature-icon">
                        <img src="/landing/images/star.png" alt="Star" width="48" height="48" className="feature-icon-img" />
                      </div>
                    </div>
                    <div className="feature-content">
                      <h3>Support Creators Directly</h3>
                      <p>Your participation helps your favorite creators get paid—without costing you extra.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How It Works for Customers */}
            <section className="how-it-works-section">
              <div className="section-container">
                <div className="section-header">
                  <h2 className="section-title">🟢 How It Works</h2>
                  <p className="section-subtitle">Simple 3-step process for customers</p>
                </div>
                <div className="steps-container">
                  <div className="step-card">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h3>Discover Deals via Influencers</h3>
                      <p>Find exclusive QR codes from creators you follow.</p>
                    </div>
                  </div>

                  <div className="step-card">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h3>Get Rewarded for Shopping</h3>
                      <p>Show the QR in-store or online to unlock the promotion.</p>
                    </div>
                  </div>

                  <div className="step-card">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h3>Collect Points with Every Visit</h3>
                      <p>Earn rewards in the app by scanning influencer codes.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Download Section */}
        <section id="download" className="download-section">
          <div className="section-container">
            <div className="download-content">
              <div className="download-text">
                <h2>Get the App</h2>
                <p>Join thousands of businesses and influencers already using Collabuu to grow their networks and increase revenue.</p>

                <div className="download-buttons">
                  <a href="#" className="download-btn app-store">
                    <svg className="store-icon" viewBox="0 0 24 24" fill="none">
                      <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.13997 6.91 8.85997 6.88C10.15 6.85 11.36 7.72 12.11 7.72C12.86 7.72 14.28 6.68 15.84 6.84C16.41 6.87 18.05 7.1 19.05 8.82C18.95 8.89 17.06 10.1 17.08 12.4C17.1 15.24 19.56 16.2 19.58 16.21C19.54 16.3 19.12 17.74 18.71 19.5Z" fill="currentColor"/>
                      <path d="M13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" fill="currentColor"/>
                    </svg>
                    <div className="store-text">
                      <span className="store-line1">Download on the</span>
                      <span className="store-line2">App Store</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-container">
            <div className="footer-content">
              <div className="footer-brand">
                <div className="footer-logo">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M16 4C18.2091 4 20 5.79086 20 8C20 10.2091 18.2091 12 16 12C13.7909 12 12 10.2091 12 8C12 5.79086 13.7909 4 16 4Z" fill="currentColor"/>
                    <path d="M8 8C10.2091 8 12 9.79086 12 12C12 14.2091 10.2091 16 8 16C5.79086 16 4 14.2091 4 12C4 9.79086 5.79086 8 8 8Z" fill="currentColor"/>
                    <path d="M16 12C18.2091 12 20 13.7909 20 16C20 18.2091 18.2091 20 16 20C13.7909 20 12 18.2091 12 16C12 13.7909 13.7909 12 16 12Z" fill="currentColor"/>
                  </svg>
                  <span>Collabuu</span>
                </div>
                <p>Connect • Collaborate • Grow</p>
              </div>

              <div className="footer-links">
                <div className="footer-section">
                  <h4>Product</h4>
                  <ul>
                    <li><a href="#audience-selector">Features</a></li>
                    <li><a href="faq.html">FAQ</a></li>
                  </ul>
                </div>

                <div className="footer-section">
                  <h4>For Users</h4>
                  <ul>
                    <li><a href="influencer-agreement.html">Influencers</a></li>
                    <li><a href="business-agreement.html">Business</a></li>
                    <li><a href="support.html">Support</a></li>
                  </ul>
                </div>

                <div className="footer-section">
                  <h4>Legal</h4>
                  <ul>
                    <li><a href="terms-of-service.html">Terms</a></li>
                    <li><a href="privacy-policy.html">Privacy</a></li>
                    <li><a href="casl-compliance.html">CASL Compliance</a></li>
                    <li><a href="cookie-policy.html">Cookie Policy</a></li>
                  </ul>
                </div>

                <div className="footer-section">
                  <h4>Admin</h4>
                  <ul>
                    <li><a href="https://app.collabuu.com" target="_blank" rel="noopener">Admin</a></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="footer-bottom">
              <div className="footer-bottom-left">
                <p>&copy; 2025 Collabuu. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>

        <Script src="/landing/js/landing-script.js" strategy="afterInteractive" />
    </div>
  );
}
